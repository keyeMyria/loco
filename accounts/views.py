from datetime import datetime, timedelta
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponseRedirect
from django.shortcuts import render_to_response

from rest_framework.decorators import api_view, permission_classes
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from loco import utils

from .models import User, UserOtp, UserDump
from .serializers import UserSerializer, UserDumpSerializer

from teams.serializers import TeamMembershipSerializer
from notifications.sms import generate_otp, send_otp


@api_view(['POST'])
@permission_classes((permissions.AllowAny,))
def getOtp(request, format=None):
    phone = request.data.get('phone')

    if not utils.validate_phone(phone):
        return Response(status=status.HTTP_400_BAD_REQUEST)

    otp = generate_otp()
    # otp = '1234'
    send_otp(phone, otp)
    user = User.objects.get_or_create_dummy(phone)

    UserOtp.objects.create_or_update(user = user, otp=otp)
    return Response() 

@csrf_exempt
@api_view(['POST'])
@permission_classes((permissions.AllowAny,))
def login_user(request, format=None):
    otp = request.data.get('otp')
    phone = request.data.get('phone')
    password = request.data.get('password')

    if otp:
        return login_otp(otp, phone)
    elif password:
        return login_password(phone, password, request)
    else:
        return Response(status=status.HTTP_400_BAD_REQUEST)

def login_otp(otp, phone):
    if not utils.validate_otp(otp) or not utils.validate_phone(phone):
        return Response(status=status.HTTP_400_BAD_REQUEST)

    if (UserOtp.objects.checkOtp(otp, phone)):
        user = User.objects.get(phone=phone)
        if not user.is_active:
            user.activate()

        Token.objects.filter(user=user).delete()
        token = Token.objects.create(user=user)

        data = UserSerializer(user).data
        data['memberships'] = TeamMembershipSerializer(user.get_memberships(), many=True).data
        data['token'] = token.key
        return Response(data=data)
    else:
        return Response(data={"error": "Invalid OTP"}, status=status.HTTP_401_UNAUTHORIZED)

def login_password(phone, password, request):
    try:
        user = User.objects.get(phone=phone)
        user = authenticate(username=phone, password=password)

        if user is None:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        login(request, user)
        # Token.objects.filter(user=user).delete()
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    except:
        return Response(status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes((permissions.IsAuthenticated,))
def validate_authentication(request, format=None):
    return Response()

@api_view(['GET'])
@permission_classes((permissions.IsAuthenticated, ))
def logout_user(request, format=None):
    session_type = request.GET.get('session_type', 'app')

    if session_type in ['all', 'app']:
        try:
            Token.objects.get(user=request.user).delete()
        except:
            pass

    if session_type in ['all', 'web']:
        try:
            logout(request)
        except:
            pass

    
    return Response()

class UserMeDetail(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (FormParser, MultiPartParser, JSONParser)

    def put(self, request, format=None):
        serializer = UserSerializer(request.user, data=request.data)        
        if serializer.is_valid():
            serializer.save()
            return Response(data=serializer.data)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, format=None):
        serializer = UserSerializer(request.user)
        return Response(data=serializer.data)

class UserDetail(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, id, format=None):
        user = get_object_or_404(user, id=id)
        serializer = UserSerializer(user)
        return Response(data=serializer.data)

class UpdateGCMToken(APIView):
    permission_classes = (permissions.IsAuthenticated, )

    def put(self, request, format=None):
        user = request.user
        gcm_token = request.data.get('gcm_token')

        if gcm_token:
            user.gcm_token = gcm_token
            user.save()
            return Response()
        else:
            return Response(data={'error', 'gcm_token is required'}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, format=None):
        request.user.gcm_token = ''
        request.user.save()
        return Response()

class UserDumpView(APIView):
    parser_classes = (FormParser, MultiPartParser, JSONParser)

    def get(self, request, format=None):
        start = request.GET.get('start', 0)
        limit = request.GET.get('limit', 10)

        try:
            start = int(start)
            limit = int(limit)
        except Exception as e:
            start = 0
            limit = 10

        data = UserDump.objects.filter(id__gte=start, id__lte=start+limit)
        serializer = UserDumpSerializer(data, many=True)

        return Response(serializer.data)

    def post(self, request, format=None):
        data = request.data
        if not data:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        dump = UserDumpSerializer(data=request.data)
        if dump.is_valid():
            dump.save()
            return Response(dump.data)

        return Response(data=dump.errors)


@api_view(['GET'])
def get_download_link(request):
    PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.loco.tracker&referrer='

    code = request.GET.get('code')
    if not code:
        return HttpResponseRedirect(PLAY_STORE_URL)

    referrer = 'utm_source%3DApp%26utm_medium%3Dinvite%26utm_campaign%3DteamGrowth%26' + \
                'invite_code%3D' + str(code) + '%26referrer_user%3D0'
    final_url = PLAY_STORE_URL + referrer

    context = {
        'url': 'loco://join?code=' + str(code),
        'web_redirect_to': final_url, 
    }
    return render_to_response('download.html', context)

