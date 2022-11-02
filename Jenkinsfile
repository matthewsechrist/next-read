pipeline {
    agent {
        docker {
            image 'python:3.12-rc-slim-buster'
        }
    }

    stages {
    stage('next-read') {
      agent {
        docker {
          // Set both label and image
          image 'matthewsechrist/next-read'
        }
      }
      steps {
        // Steps run in maven:3-alpine docker container on docker agent
        sh 'docker run next-read 140919874X'
      }
    }
    }
}


