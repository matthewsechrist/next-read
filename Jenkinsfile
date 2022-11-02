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
              POTENTIAL_AUTHORS = sh(script: "python Get_Potential_Authors.py 140919874X", returnStdout: true).toString().trim()
            }
        }
    }
}