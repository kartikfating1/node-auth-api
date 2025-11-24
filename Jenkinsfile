pipeline {
    agent any

    environment {
        AWS_REGION = "ap-south-1"
        ECR_ACCOUNT = "458945172685"
        ECR_REPO = "featureauth"
        IMAGE_TAG = "latest"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/kartikfating1/node-auth-api.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat """
                docker build -t %ECR_ACCOUNT%.dkr.ecr.%AWS_REGION%.amazonaws.com/%ECR_REPO%:%IMAGE_TAG% .
                """
            }
        }

        stage('Login to ECR') {
            steps {
                bat """
                aws ecr get-login-password --region %AWS_REGION% | docker login --username AWS --password-stdin %ECR_ACCOUNT%.dkr.ecr.%AWS_REGION%.amazonaws.com
                """
            }
        }

        stage('Push Image to ECR') {
            steps {
                bat "docker push %ECR_ACCOUNT%.dkr.ecr.%AWS_REGION%.amazonaws.com/%ECR_REPO%:%IMAGE_TAG%"
            }
        }

        stage('Update Deployment in EKS') {
            steps {
                bat "kubectl set image deployment/featureauth featureauth=%ECR_ACCOUNT%.dkr.ecr.%AWS_REGION%.amazonaws.com/%ECR_REPO%:%IMAGE_TAG% -n mongo"
            }
        }
    }

    post {
        success {
            echo "✔ Deployment Successful!"
        }
        failure {
            echo "❌ Deployment Failed!"
        }
    }
}
