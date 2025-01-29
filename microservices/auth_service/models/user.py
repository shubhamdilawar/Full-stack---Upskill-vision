# auth_service/models/user.py
from bson import ObjectId
class User:
    def __init__(self, first_name, last_name, email, password, role, status='pending', _id=None):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.password = password
        self.role = role
        self.status = status
        self._id = _id if _id else ObjectId()

    def to_dict(self):
      return {
          '_id': str(self._id),
           'first_name': self.first_name,
           'last_name': self.last_name,
           'email': self.email,
           'password': self.password,
           'role': self.role,
           'status': self.status,
           }

    @classmethod
    def from_dict(cls, data):
      _id = data.get('_id')
      if _id:
        _id = ObjectId(_id)
      return cls(
          first_name = data.get('first_name', ''),
           last_name = data.get('last_name', ''),
           email = data.get('email', ''),
           password = data.get('password', ''),
           role = data.get('role', ''),
           status = data.get('status', 'pending'),
           _id=_id
      )