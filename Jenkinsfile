pipeline {
    agent {
        docker {
            image 'python:3.12-rc-slim-buster'
        }
    }

    stages {
        stage('GitGuardian Scan') {
            agent {
                docker { image 'gitguardian/ggshield:latest' }
            }
            environment {
                GITGUARDIAN_API_KEY = credentials('gitguardian-api-key')
            }
            steps {
                sh 'ggshield secret scan ci'
            }
        }
        stage('Test'){
            steps{
                sh 'python Get_Potential_Authors.py 140919874X'
            }
        }
    }
}