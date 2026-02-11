// =========================================================
// [Jenkinsfile] - 빌드 및 Harbor 전송 (Watchtower 연동)
// + SonarQube 기능이 주석으로 숨겨져 있음
// =========================================================

pipeline {
    agent any
    options {
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')  // 크로스플랫폼 빌드를 위한 타임아웃 30분
    }
    triggers {
        GenericTrigger(
            genericVariables: [
                // 리포지토리 주소를 변수로 받습니다.
                [key: 'REPO_URL', value: '$.repository.clone_url', defaultValue: '']
            ],
            
            // 👇 [중요] 토큰을 인프라와 똑같이 맞춥니다!
            token: 'nangman-trigger',
            
            causeString: 'Homepage Push 감지됨',
            printContributedVariables: true,
            printPostContent: true,
            
            // 👇 [핵심 필터]
            // 리포지토리 주소에 '홈페이지_리포지토리_이름'이 포함될 때만 이 파이프라인을 실행!
            // (인프라 쪽 Push나 매터모스트 버튼은 여기서 걸러집니다)
            regexpFilterText: '$REPO_URL',
            regexpFilterExpression: '.*hooni_home.*'
        )
    }
    environment {
        // [기본 설정] Harbor 정보 (필수)
        HARBOR_URL      = 'harbor.nangman.cloud'
        HARBOR_PROJECT  = 'library'
        HARBOR_CREDS_ID = 'harbor-auth'

        // -------------------------------------------------
        // [FUTURE] 소나큐브 설정 (나중에 주석 해제하여 사용)
        // Jenkins 관리 -> System Configuration에서 설정한 이름과 같아야 함
        // -------------------------------------------------
        // SONAR_SERVER    = 'my-sonarqube-server' 
        // SONAR_SCANNER   = 'my-sonar-scanner' 
    }

    stages {
        // 1단계: 레포지토리 이름 및 태그 설정
        stage('Initialize') {
            steps {
                script {
                    // 예: 'nangman-infra/chulsu-web/main' -> 'chulsu-web' 추출
                    def jobNameParts = env.JOB_NAME.split('/')
                    env.REPO_NAME = jobNameParts[1].toLowerCase()
                    env.IMAGE_TAG = "v${env.BUILD_NUMBER}"
                    echo "타겟: ${env.REPO_NAME} / 태그: ${env.IMAGE_TAG}"
                }
            }
        }

        // -------------------------------------------------
        // [FUTURE] 2단계: 소나큐브 코드 품질 검사 (현재 봉인됨)
        // 나중에 사용하려면 아래의 '/*' 와 '*/' 를 지우세요.
        // -------------------------------------------------
        /* stage('SonarQube Analysis') {
            steps {
                script {
                    echo "소나큐브 검사 시작..."
                    def scannerHome = tool name: "${env.SONAR_SCANNER}", type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                    
                    withSonarQubeEnv("${env.SONAR_SERVER}") {
                        // 소나큐브 스캐너 실행
                        // -Dsonar.projectKey : 프로젝트 식별키 (레포 이름 자동 사용)
                        // -Dsonar.sources=.  : 현재 폴더의 모든 코드 검사
                        sh "${scannerHome}/bin/sonar-scanner \
                           -Dsonar.projectKey=${env.REPO_NAME} \
                           -Dsonar.sources=. \
                           -Dsonar.host.url=http://소나큐브주소:9000 \
                           -Dsonar.login=소나큐브토큰_또는_자동설정"
                    }
                }
            }
        }
        
        // (선택사항) 품질 게이트: 점수 미달 시 빌드 중단시키는 기능
        // stage("Quality Gate") {
        //     steps {
        //         timeout(time: 1, unit: 'HOURS') {
        //             waitForQualityGate abortPipeline: true
        //         }
        //     }
        // }
        */

        // 3단계: 도커 이미지 빌드 (크로스플랫폼 + 캐시)
        stage('Docker Build & Push') {
            steps {
                script {
                    echo "Docker Buildx를 사용한 크로스플랫폼 이미지 빌드 중 (캐시 활성화)..."
                    
                    withCredentials([usernamePassword(credentialsId: HARBOR_CREDS_ID, passwordVariable: 'PW', usernameVariable: 'USER')]) {
                        withEnv([
                            "H_URL=${HARBOR_URL}", 
                            "H_PROJECT=${HARBOR_PROJECT}", 
                            "R_NAME=${env.REPO_NAME}", 
                            "I_TAG=${env.IMAGE_TAG}"
                        ]) {
                            sh '''
                                # Harbor 로그인
                                echo "$PW" | docker login $H_URL -u "$USER" --password-stdin
                                
                                # Buildx 빌더 생성 또는 사용
                                docker buildx create --name multiarch-builder --use 2>/dev/null || docker buildx use multiarch-builder
                                
                                # Buildx 부트스트랩
                                docker buildx inspect --bootstrap
                                
                                # 크로스플랫폼 빌드 및 Harbor에 직접 푸시 (캐시 사용)
                                # 지원 플랫폼: linux/amd64, linux/arm64
                                # 캐시: Harbor 레지스트리 캐시 사용 (빌드 속도 2-3배 향상)
                                docker buildx build \
                                    --platform linux/amd64,linux/arm64 \
                                    --tag $H_URL/$H_PROJECT/$R_NAME:$I_TAG \
                                    --tag $H_URL/$H_PROJECT/$R_NAME:latest \
                                    --cache-from type=registry,ref=$H_URL/$H_PROJECT/$R_NAME:buildcache \
                                    --cache-to type=registry,ref=$H_URL/$H_PROJECT/$R_NAME:buildcache,mode=max \
                                    --push \
                                    .
                                
                                # Harbor 로그아웃
                                docker logout $H_URL
                            '''
                        }
                    }
                    
                    echo "Harbor에 이미지가 성공적으로 푸시되었습니다."
                    echo "이미지: ${HARBOR_URL}/${HARBOR_PROJECT}/${env.REPO_NAME}:${env.IMAGE_TAG}"
                    echo "플랫폼: linux/amd64, linux/arm64"
                    echo "캐시: Harbor 레지스트리 캐시 활성화 (다음 빌드부터 속도 향상)"
                }
            }
        }
    }

        // 빌드 후 처리 (성공/실패 알림 및 로컬 이미지 청소)
    post {
        // 1. 빌드 성공 시 알림
        success {
            mattermostSend (
                color: 'good',
                message: ":tada: 빌드 성공! 배포가 완료되었습니다.\n프로젝트: ${env.JOB_NAME} #${env.BUILD_NUMBER}\n바로가기: ${env.BUILD_URL}"
            )
        }

        // 2. 빌드 실패 시 알림
        failure {
            mattermostSend (
                color: 'danger',
                message: ":rotating_light: 빌드 실패... 로그를 확인해주세요.\n프로젝트: ${env.JOB_NAME} #${env.BUILD_NUMBER}\n바로가기: ${env.BUILD_URL}"
            )
        }
        
        always {
            script {
                echo "빌드 완료. Buildx는 이미지를 직접 푸시하므로 로컬 정리가 불필요합니다."
            }
        }
    }
}