pipeline {

    agent none
    stages {
        stage ('First Step') {
            agent {
                docker {
                    image 'docker'
                    args '-v /var/run/docker.sock:/var/run/docker.sock'
                }
            }
            steps {
                sh 'docker ps -a'
            }
        }

        stage('Test'){
            agent {
                docker {
                    image 'python:3.12-rc-slim-buster'
                }
            }
            steps{
                sh 'pip install -U pytest'
                sh 'pytest'
                sh 'python Get_Potential_Authors.py 140919874X'
            }
        }
    }
}