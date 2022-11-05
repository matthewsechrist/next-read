pipeline {
    agent none 
    stages {
        stage('Build') { 
            agent {
                docker {
                    image 'python:3.12-rc-slim-buster' 
                }
            }
            steps {
              sh 'echo Build'  
            }
        }
    }
}