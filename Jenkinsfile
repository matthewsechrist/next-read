pipeline {
agent none
    stages {
        
        stage('Test'){
                agent {
        docker {
            image 'python:3.12-rc-slim-buster'
        }
    }
            steps{
                sh 'python Get_Potential_Authors.py 140919874X'
            }
        }
    }
    }