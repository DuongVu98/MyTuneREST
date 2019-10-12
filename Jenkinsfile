pipeline {
    agent any

    tools {nodejs "node"}
    
    stages {
        stage ("Example"){
            steps {
                sh 'yarn list'
            }
        }
    }
}