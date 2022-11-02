pipeline {
    agent {
        docker {
            image 'python3.6'
        }
    }

    stages {
        stage('Stage 1') {
            steps {
                sh 'echo foo'
            }
        }
        stage('Stage 2') {
            steps {
                sh 'echo bar'
            }
        }
    }
}


