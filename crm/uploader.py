import csv, xlrd
from . import models, serializers

NO_VALUE = 1
INVALID_VALUE = 2

def get_int(value, default):
    if not value:
        return (default, NO_VALUE)

    try:
        return (int(value), 0)
    except:
        return (default, INVALID_VALUE)

def validate_merchant_rows(team, rows):
    if not rows:
        return ([], None)

    merchants = []
    states = []
    cities = []
    results = []

    counter = 0
    for row in rows:
        counter += 1
        if len(row) != 6:
            return (None, "Every row should have exactly 6 columns. Check row: {0}".format(counter))

        name, state, city, address, phone, merchant_type = row
        if not name:
            return (None, "Empty name. Check row: {0}".format(counter))

        phone, err = get_int(phone, '')
        if err == INVALID_VALUE:
            return (None, "Invalid phone number. Check row: {0}".format(counter))            

        if city:
            city = city.lower()
            cities.append(city)
        else:
            city = None

        if state:
            state = state.lower()
            states.append(state)
        else:
            state = None

        merchants.append({
            'name': name,
            'city': city,
            'state': state,
            'address': address if address else "",
            'phone': phone if str(phone) else "",
            'merchant_type': merchant_type if merchant_type else "",
            'team': team
            })

    states_list = models.State.objects.filter(name_lower__in=set(states))
    state_map = {s.name_lower: s for s in states_list}
    cities_list = models.City.objects.filter(name_lower__in=set(cities))
    city_map = {c.name_lower: c for c in cities_list}

    for merchant in merchants:
        merchant_state = merchant.get('state')
        if merchant_state:
            state = state_map.get(merchant_state)
            if not state:
                return (None, "Invalid state {}".format(merchant_state))

            merchant['state'] = state

        merchant_city = merchant.get('city')
        if merchant_city:
            city = city_map.get(merchant_city)
            if not city:
                return (None, "Invalid city {}".format(merchant_city))

            merchant['city'] = city

        results.append(models.Merchant(**merchant))

    return (results, None)

def upload_merchants(upload_id):
    upload = models.MerchantUpload.objects.get(id=upload_id)
    upload.status = models.MerchantUpload.STATUS_PROGRESS
    upload.save()

    if (upload.data.name.endswith('.csv')):
        reader = csv.reader(upload.data)
    elif (upload.data.name.endswith('.xlsx')):
        wb = xlrd.open_workbook(upload.data.path)
        sheet = wb.sheet_by_index(0)
        reader = []
        for row in range(sheet.nrows):
            reader.append(sheet.row_values(row))
    else:
        upload.message = "Unsupported file format"
        upload.status = models.MerchantUpload.STATUS_FAILED
        upload.save()
        return

    results, err = validate_merchant_rows(upload.team, reader)

    if err:
        upload.message = err
        upload.status = models.MerchantUpload.STATUS_FAILED
        upload.save()
        return 

    try:
        merchants = models.Merchant.objects.bulk_create(results)
        upload.message = "{} entries added".format(len(merchants))
        upload.status = models.MerchantUpload.STATUS_SUCCESS 
        upload.save()
    except Exception as e:
        upload.message = e.message
        upload.status = models.MerchantUpload.STATUS_FAILED
        upload.save()

def validate_item_rows(team, rows):
    if not rows:
        return ([], None)

    items = []
    results = []

    counter = 0
    for row in rows:
        counter += 1
        if len(row) != 3:
            return (None, "Every row should have exactly 3 columns. Check row: {0}".format(counter))

        name, price, serial_number = row
        if not name:
            return (None, "Empty name at row: {0}".format(counter))

        if not price:
            return (None, "Empty price at row: {0}".format(counter))

        item = {
            'name': name,
            'price': price,
            'serial_number': serial_number if serial_number else "",
            'team': team
            }

        serializer = serializers.ItemSerializer(data=item)
        if not serializer.is_valid():
            return (None, "Error in row {0} {1}".format(counter, serializer.errors))

        items.append(item)

    for item in items:
        results.append(models.Item(**item))

    return (results, None)

def upload_items(upload_id):
    upload = models.ItemUpload.objects.get(id=upload_id)
    upload.status = models.ItemUpload.STATUS_PROGRESS
    upload.save()

    reader = csv.reader(upload.data)
    results, err = validate_item_rows(upload.team, reader)

    if err:
        upload.message = err
        upload.status = models.ItemUpload.STATUS_FAILED
        upload.save()
        return 

    try:
        items = models.Item.objects.bulk_create(results)
        upload.message = "{} entries added".format(len(items))
        upload.status = models.ItemUpload.STATUS_SUCCESS 
        upload.save()
    except Exception as e:
        upload.message = e.message
        upload.status = models.ItemUpload.STATUS_FAILED
        upload.save()