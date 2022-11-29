pipeline {
    agent {
        docker {
            image 'python:3.12-rc-slim-buster'
        }
    }

    stages {
        stage('GitGuardian Scan') {
            environment{
                GITGUARDIAN_API_KEY = credentials('GitGuardian_Key')
            }
            agent {
                docker { image 'gitguardian/ggshield:latest' }
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