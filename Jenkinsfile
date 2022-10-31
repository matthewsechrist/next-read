pipeline {
    agent {
        docker { image 'matthewsechrist/next-read' }
    }
    stages {
        stage('Test') {
            steps {
                sh 'docker run next-read 140919874X'
            }
        }
    }
}