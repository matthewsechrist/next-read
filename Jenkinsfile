pipeline {

    agent none
    stages {
        stage('Test'){
            agent {
                docker {
                    image 'python'
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