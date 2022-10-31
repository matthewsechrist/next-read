// Jenkinsfile

pipeline {
  // Assign to docker agent(s) label, could also be 'any'
agent any
  stages {
    stage('Docker node test') {
      agent {
        docker {
          // Set both label and image
          image 'node:7-alpine'
          args '--name docker-node' // list any args
        }
      }
      steps {
        // Steps run in node:7-alpine docker container on docker agent
        sh 'node --version'
      }
    }

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


