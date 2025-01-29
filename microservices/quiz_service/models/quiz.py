# quiz_service/models/quiz.py
from bson import ObjectId

class Quiz:
    def __init__(self, title, description, time_limit, questions, _id=None, course_id=None, attempts_count=0, average_score=0, pass_rate=0):
        self.title = title
        self.description = description
        self.time_limit = time_limit
        self.questions = questions
        self._id = _id if _id else ObjectId()
        self.course_id = course_id
        self.attempts_count = attempts_count
        self.average_score = average_score
        self.pass_rate = pass_rate

    def to_dict(self):
        return {
            '_id': str(self._id),
            'title': self.title,
            'description': self.description,
            'time_limit': self.time_limit,
            'questions': self.questions,
             'course_id': self.course_id,
             'attempts_count': self.attempts_count,
            'average_score': self.average_score,
            'pass_rate': self.pass_rate
        }

    @classmethod
    def from_dict(cls, data):
        _id = data.get('_id')
        if _id:
            _id = ObjectId(_id)

        return cls(
           title = data.get('title', ''),
            description = data.get('description', ''),
            time_limit = data.get('time_limit', 0),
           questions = data.get('questions', []),
           _id=_id,
           course_id = data.get('course_id'),
           attempts_count = data.get('attempts_count',0),
            average_score = data.get('average_score',0),
            pass_rate = data.get('pass_rate',0)
        )