pipeline {
    agent any

    tools {nodejs "node"}
    
    stages {
        stage('Prepare') {
            steps{
                
                sh "yarn install"
            }
        }
        stage ("Example"){
            steps {
                sh 'yarn list --depth=0'
            }
        }
    }
}