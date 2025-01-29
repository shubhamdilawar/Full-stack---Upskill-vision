from setuptools import setup, find_packages

setup(
    name="upskill_vision_microservices",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        'flask==2.3.3',
        'flask-cors==5.0.0',
        'pymongo[srv]==4.10.1',
        'python-dotenv==1.0.1',
        'requests==2.31.0',
        'PyJWT==2.8.0',
        'bcrypt==4.1.2'
    ]
) 