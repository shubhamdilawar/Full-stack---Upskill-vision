@echo off
echo Starting all microservices...

start cmd /k "cd services/api-gateway && python app.py"
timeout /t 2
start cmd /k "cd services/auth-service && python app.py"
timeout /t 2
start cmd /k "cd services/course-service && python app.py"
timeout /t 2
start cmd /k "cd services/quiz-service && python app.py"
timeout /t 2
start cmd /k "cd services/user-service && python app.py"
timeout /t 2
start cmd /k "cd services/assignment-service && python app.py"

echo All services started!
echo Press any key to stop all services...
pause

taskkill /F /IM python.exe /T 