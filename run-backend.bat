@echo off
set JAVA_HOME=C:\Program Files\Java\jdk-21
set DB_USERNAME=rajkumar
set DB_PASSWORD=Raj@123
set JWT_SECRET=nexabank_super_secret_jwt_key_256bit_strong_value_here
set MVN="C:\Users\rajku\Downloads\apache-maven-3.9.9-bin\apache-maven-3.9.9\bin\mvn.cmd"

echo ============================================
echo  Starting NexaBank Spring Boot Backend...
echo ============================================
echo  JAVA_HOME : %JAVA_HOME%
echo  DB        : jdbc:mysql://localhost:3306/online_banking
echo  USER      : %DB_USERNAME%
echo ============================================

%MVN% spring-boot:run
pause
