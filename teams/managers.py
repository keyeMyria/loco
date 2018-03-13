from django.db import models


class MessageManager(models.Manager):
    CONV_QUERY = 'select msgs.* from teams_message msgs join (select thread, max(created) as created from teams_message where sender_id={0} or target_id={0} and team_id = {1} group by thread) conv on msgs.thread=conv.thread and msgs.created=conv.created order by conv.created desc'
    
    def get_conversations(self, user_id, team_id):
        query = self.CONV_QUERY.format(user_id, team_id)
        return self.raw(query)