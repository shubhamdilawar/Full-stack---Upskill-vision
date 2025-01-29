# Optional model, can add if needed later.
from bson import ObjectId

class AuditLog:
   def __init__(self, user_id, action_type, course_id, details=None,_id=None, timestamp=None):
        self.user_id = user_id
        self.action_type = action_type
        self.course_id = course_id
        self.details = details
        self._id = _id if _id else ObjectId()
        self.timestamp = timestamp

   def to_dict(self):
     return {
         '_id': str(self._id),
         'user_id': self.user_id,
         'action_type': self.action_type,
         'course_id': self.course_id,
         'details': self.details,
         'timestamp': self.timestamp
     }
   @classmethod
   def from_dict(cls, data):
       _id = data.get('_id')
       if _id:
            _id = ObjectId(_id)
       return cls(
           user_id = data.get('user_id'),
           action_type = data.get('action_type'),
           course_id = data.get('course_id'),
           details = data.get('details', ''),
            _id = _id,
            timestamp = data.get('timestamp')
       )