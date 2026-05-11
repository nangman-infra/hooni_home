def SPOT_AGENT_LABEL = 'spot-agent'
def ONPREM_WATCHTOWER_TRIGGER_AGENT_LABEL = 'onprem-watchtower-trigger'
def PRIMARY_BUILDX_BUILDER = 'default'
def FALLBACK_BUILDX_BUILDER = 'multiarch-builder'
def WEBHOOK_TRIGGER_TOKEN_CREDENTIAL_ID = 'GITHUB_WEBHOOK_TRIGGER_TOKEN'
def REPO_SLUG = 'nangman-infra/hooni_home'
def MAIN_BRANCH_REF = 'refs/heads/main'
def DEFAULT_REPO_HTTP_URL = 'https://github.com/nangman-infra/hooni_home.git'
def PNPM_VERSION = '10.26.1'

pipeline {
    agent none

    triggers {
        GenericTrigger(
            genericVariables: [
                [key: 'GIT_REF', value: '$.ref', defaultValue: ''],
                [key: 'REPO_URL', value: '$.repository.clone_url', defaultValue: ''],
                [key: 'BEFORE_SHA', value: '$.before', defaultValue: ''],
                [key: 'AFTER_SHA', value: '$.after', defaultValue: '']
            ],
            tokenCredentialId: WEBHOOK_TRIGGER_TOKEN_CREDENTIAL_ID,
            causeString: 'hooni_home main push detected',
            regexpFilterText: '$REPO_URL $GIT_REF',
            regexpFilterExpression: ".*${REPO_SLUG}.* ${MAIN_BRANCH_REF}",
            printContributedVariables: true,
            printPostContent: true
        )
    }

    environment {
        HARBOR_URL = 'harbor.nangman.cloud'
        HARBOR_PROJECT = 'library'
        HARBOR_CREDS_ID = 'NANGMAN_HARBOR_ROBOT_ACCOUNT'
        IMAGE_NAME = 'hooni_home'
        APP_DIRECTORY = '.'
        WATCHTOWER_URL = 'http://172.16.0.15:18081'
        WATCHTOWER_TOKEN = credentials('nangman-personal-web-watchtower-token')
        APP_HEALTH_URL = 'http://172.16.0.15:10003'
        DEPLOY_TIMEOUT_SECONDS = '180'
        SONARQUBE_INSTALLATION = 'sonarqube'
        SONAR_SCANNER_TOOL = 'SonarScanner'
        SONAR_PROJECT_KEY = 'hooni_home'
        SONAR_PROJECT_NAME = 'hooni_home'
        CI = 'true'
        DOCKER_BUILDKIT = '1'
        DOCKER_CLI_EXPERIMENTAL = 'enabled'
        PLATFORMS = 'linux/amd64,linux/arm64'
    }

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 60, unit: 'MINUTES')
        timestamps()
        ansiColor('xterm')
    }

    stages {
        stage('Validate And Build On Spot') {
            agent { label SPOT_AGENT_LABEL }
            stages {
                stage('Checkout') {
                    steps {
                        checkout scm
                    }
                }

                stage('Initialize') {
                    steps {
                        script {
                            sh 'git fetch --all --tags --prune'

                            if (env.AFTER_SHA?.trim()) {
                                sh """
                                    if git cat-file -e ${env.AFTER_SHA}^{commit} >/dev/null 2>&1; then
                                        git checkout ${env.AFTER_SHA}
                                    fi
                                """
                            }

                            env.FULL_SHA = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
                            env.SHORT_SHA = sh(script: 'git rev-parse --short=12 HEAD', returnStdout: true).trim()
                            env.BUILD_TIMESTAMP = sh(script: 'date -u +%Y-%m-%dT%H:%M:%SZ', returnStdout: true).trim()
                            env.IMAGE_TAG = "v${env.BUILD_NUMBER}"
                            env.IMAGE_REPO = "${env.HARBOR_URL}/${env.HARBOR_PROJECT}/${env.IMAGE_NAME}"
                            env.IMAGE_VERSION = "${env.IMAGE_REPO}:${env.IMAGE_TAG}"
                            env.IMAGE_LATEST = "${env.IMAGE_REPO}:latest"
                            env.IMAGE_CACHE = "${env.IMAGE_REPO}:buildcache"
                            env.BUILD_REF = env.GIT_REF ?: MAIN_BRANCH_REF
                            env.REPO_HTTP_URL = env.REPO_URL?.trim() ? env.REPO_URL.trim() : DEFAULT_REPO_HTTP_URL
                            env.DEPLOY_REQUIRED = 'true'
                            env.FAILURE_CATEGORY = 'build'
                            env.FAILURE_STAGE = 'Initialize'
                            env.FAILURE_REASON = '초기화 단계에서 실패했습니다.'

                            def diffLabel = 'HEAD^..HEAD'
                            def changedFilesText = ''
                            if (env.BEFORE_SHA?.trim() && env.AFTER_SHA?.trim()) {
                                def canDiff = sh(
                                    script: "git cat-file -e ${env.BEFORE_SHA}^{commit} >/dev/null 2>&1 && git cat-file -e ${env.AFTER_SHA}^{commit} >/dev/null 2>&1",
                                    returnStatus: true
                                ) == 0
                                if (canDiff) {
                                    diffLabel = "${env.BEFORE_SHA.take(12)}..${env.AFTER_SHA.take(12)}"
                                    changedFilesText = sh(script: "git diff --name-only ${env.BEFORE_SHA} ${env.AFTER_SHA}", returnStdout: true).trim()
                                }
                            } else if (sh(script: 'git rev-parse HEAD^ >/dev/null 2>&1', returnStatus: true) == 0) {
                                changedFilesText = sh(script: 'git diff --name-only HEAD^ HEAD', returnStdout: true).trim()
                            } else {
                                diffLabel = 'full-tree'
                                changedFilesText = sh(script: 'git ls-tree --name-only -r HEAD', returnStdout: true).trim()
                            }

                            currentBuild.displayName = "#${env.BUILD_NUMBER} ${env.SHORT_SHA}"
                            currentBuild.description = "main -> ${env.IMAGE_TAG} | ${env.IMAGE_NAME}"

                            echo "Repository: ${env.REPO_HTTP_URL}"
                            echo "Branch ref: ${env.BUILD_REF}"
                            echo "Commit: ${env.FULL_SHA}"
                            echo "Diff scope: ${diffLabel}"
                            echo "Changed files: ${changedFilesText ?: '(none)'}"
                            echo "Image repository: ${env.IMAGE_REPO}"
                            echo "Health check URL: ${env.APP_HEALTH_URL}"
                        }
                    }
                }

                stage('Install Dependencies') {
                    steps {
                        script {
                            env.FAILURE_CATEGORY = 'quality'
                            env.FAILURE_STAGE = 'Install Dependencies'
                            env.FAILURE_REASON = '의존성 설치에 실패했습니다.'
                        }
                        sh '''
                            set -eu
                            node --version
                            corepack --version
                            corepack enable
                            corepack prepare pnpm@''' + PNPM_VERSION + ''' --activate
                            pnpm --version
                            pnpm install --frozen-lockfile
                        '''
                    }
                }

                stage('Test / Lint / Build') {
                    steps {
                        script {
                            env.FAILURE_CATEGORY = 'quality'
                            env.FAILURE_STAGE = 'Test / Lint / Build'
                            env.FAILURE_REASON = '테스트, 린트 또는 빌드 검증에 실패했습니다.'
                        }
                        dir(env.APP_DIRECTORY) {
                            sh '''
                                set -eu

                                if node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts.test ? 0 : 1)"; then
                                    pnpm test
                                else
                                    echo "No test script; skipping test."
                                fi

                                pnpm lint
                                pnpm build
                            '''
                        }
                    }
                }

                stage('SonarQube Analysis') {
                    steps {
                        script {
                            env.FAILURE_CATEGORY = 'sonar'
                            env.FAILURE_STAGE = 'SonarQube Analysis'
                            env.FAILURE_REASON = 'SonarQube 분석에 실패해 배포가 중단되었습니다.'

                            def scannerHome = tool env.SONAR_SCANNER_TOOL
                            def candidates = ['app', 'src', 'components', 'domains', 'lib', 'pages']
                            def sourceDirs = candidates.findAll { path ->
                                fileExists(env.APP_DIRECTORY == '.' ? path : "${env.APP_DIRECTORY}/${path}")
                            }.collect { path ->
                                env.APP_DIRECTORY == '.' ? path : "${env.APP_DIRECTORY}/${path}"
                            }
                            env.SONAR_SOURCES = sourceDirs ? sourceDirs.join(',') : env.APP_DIRECTORY
                            env.SONAR_COVERAGE_REPORT = env.APP_DIRECTORY == '.' ? 'coverage/lcov.info' : "${env.APP_DIRECTORY}/coverage/lcov.info"

                            writeFile(
                                file: 'sonar-project.properties',
                                text: """
                                    sonar.projectKey=${env.SONAR_PROJECT_KEY}
                                    sonar.projectName=${env.SONAR_PROJECT_NAME}
                                    sonar.projectVersion=${env.IMAGE_TAG}
                                    sonar.projectBaseDir=.
                                    sonar.sourceEncoding=UTF-8
                                    sonar.scm.revision=${env.FULL_SHA}
                                    sonar.sources=${env.SONAR_SOURCES}
                                    sonar.exclusions=**/node_modules/**,**/.next/**,**/out/**,**/coverage/**,**/dist/**,**/*.config.*,**/next-env.d.ts
                                    sonar.javascript.lcov.reportPaths=${env.SONAR_COVERAGE_REPORT}
                                    sonar.javascript.node.maxspace=4096
                                """.stripIndent().trim() + '\n'
                            )

                            withSonarQubeEnv(env.SONARQUBE_INSTALLATION) {
                                sh "\"${scannerHome}/bin/sonar-scanner\" -Dproject.settings=sonar-project.properties"
                            }
                        }
                    }
                }

                stage('Quality Gate') {
                    steps {
                        script {
                            env.FAILURE_CATEGORY = 'sonar'
                            env.FAILURE_STAGE = 'Quality Gate'
                            env.FAILURE_REASON = 'SonarQube 품질 기준을 통과하지 못해 배포가 중단되었습니다.'
                        }
                        timeout(time: 30, unit: 'MINUTES') {
                            waitForQualityGate abortPipeline: true
                        }
                    }
                }

                stage('Setup Buildx') {
                    steps {
                        script {
                            env.FAILURE_CATEGORY = 'build'
                            env.FAILURE_STAGE = 'Setup Buildx'
                            env.FAILURE_REASON = 'Docker buildx 초기화에 실패했습니다.'
                        }
                        sh """
                            docker buildx version

                            if docker buildx inspect ${PRIMARY_BUILDX_BUILDER} >/dev/null 2>&1; then
                                docker buildx use ${PRIMARY_BUILDX_BUILDER}
                                docker buildx inspect ${PRIMARY_BUILDX_BUILDER} --bootstrap
                            else
                                if docker buildx inspect ${FALLBACK_BUILDX_BUILDER} >/dev/null 2>&1; then
                                    docker buildx use ${FALLBACK_BUILDX_BUILDER}
                                else
                                    docker buildx create --name ${FALLBACK_BUILDX_BUILDER} --use --platform "\$PLATFORMS"
                                fi

                                docker buildx inspect ${FALLBACK_BUILDX_BUILDER} --bootstrap
                            fi
                        """
                    }
                }

                stage('Docker Build & Push') {
                    options {
                        timeout(time: 45, unit: 'MINUTES')
                    }
                    steps {
                        script {
                            env.FAILURE_CATEGORY = 'build'
                            env.FAILURE_STAGE = 'Docker Build & Push'
                            env.FAILURE_REASON = 'Docker 이미지 빌드 또는 Harbor 푸시에 실패했습니다.'

                            withCredentials([
                                usernamePassword(
                                    credentialsId: env.HARBOR_CREDS_ID,
                                    usernameVariable: 'HARBOR_USERNAME',
                                    passwordVariable: 'HARBOR_PASSWORD'
                                )
                            ]) {
                                sh 'echo "$HARBOR_PASSWORD" | docker login "$HARBOR_URL" -u "$HARBOR_USERNAME" --password-stdin'
                                try {
                                    def cacheFromArg = sh(
                                        script: "docker buildx imagetools inspect ${env.IMAGE_CACHE} >/dev/null 2>&1",
                                        returnStatus: true
                                    ) == 0 ? "--cache-from type=registry,ref=${env.IMAGE_CACHE}" : ""
                                    def buildArgs = [
                                        "--platform ${env.PLATFORMS}",
                                        "--tag ${env.IMAGE_VERSION}",
                                        "--tag ${env.IMAGE_LATEST}",
                                        "--cache-to type=registry,ref=${env.IMAGE_CACHE},mode=max",
                                        "--label org.opencontainers.image.created=${env.BUILD_TIMESTAMP}",
                                        "--label org.opencontainers.image.revision=${env.FULL_SHA}",
                                        "--label org.opencontainers.image.source=${env.REPO_HTTP_URL}",
                                        "--label org.opencontainers.image.version=${env.IMAGE_TAG}",
                                        "--pull",
                                        "--push",
                                        "--progress=plain",
                                        "."
                                    ]
                                    if (cacheFromArg) {
                                        buildArgs.add(4, cacheFromArg)
                                    }

                                    sh """
                                        docker buildx build \\
                                            ${buildArgs.join(' \\\n                                            ')}
                                    """
                                } finally {
                                    sh 'docker logout "$HARBOR_URL"'
                                }
                            }
                        }
                    }
                }

                stage('Verify Images') {
                    steps {
                        script {
                            env.FAILURE_CATEGORY = 'build'
                            env.FAILURE_STAGE = 'Verify Images'
                            env.FAILURE_REASON = 'Harbor에 푸시된 이미지 검증에 실패했습니다.'
                        }
                        withCredentials([
                            usernamePassword(
                                credentialsId: env.HARBOR_CREDS_ID,
                                usernameVariable: 'HARBOR_USERNAME',
                                passwordVariable: 'HARBOR_PASSWORD'
                            )
                        ]) {
                            sh '''
                                set -eu
                                echo "$HARBOR_PASSWORD" | docker login "$HARBOR_URL" -u "$HARBOR_USERNAME" --password-stdin
                                docker buildx imagetools inspect "$IMAGE_VERSION"
                                docker buildx imagetools inspect "$IMAGE_LATEST"
                                docker logout "$HARBOR_URL"
                            '''
                        }
                    }
                }
            }
        }

        stage('Deploy On Onprem') {
            agent { label ONPREM_WATCHTOWER_TRIGGER_AGENT_LABEL }
            when {
                expression { env.DEPLOY_REQUIRED == 'true' }
            }
            stages {
                stage('Trigger Watchtower') {
                    steps {
                        script {
                            env.FAILURE_CATEGORY = 'deploy'
                            env.FAILURE_STAGE = 'Trigger Watchtower'
                            env.FAILURE_REASON = 'Watchtower 배포 트리거 호출에 실패했습니다.'
                        }
                        sh '''
                            set -eu

                            response=$(curl -sS -w "\\n%{http_code}" \
                                -H "Authorization: Bearer $WATCHTOWER_TOKEN" \
                                "$WATCHTOWER_URL/v1/update")

                            http_code=$(echo "$response" | tail -n1)
                            body=$(echo "$response" | sed '$d')

                            if [ "$http_code" -eq 200 ]; then
                                echo "Watchtower update triggered successfully"
                                echo "Response: $body"
                            else
                                echo "Failed to trigger Watchtower update"
                                echo "HTTP Code: $http_code"
                                echo "Response: $body"
                                exit 1
                            fi
                        '''
                    }
                }

                stage('Verify Deployment') {
                    steps {
                        script {
                            env.FAILURE_CATEGORY = 'deploy'
                            env.FAILURE_STAGE = 'Verify Deployment'
                            env.FAILURE_REASON = '배포 후 health check에 실패했습니다.'
                        }
                        sh '''
                            set -eu
                            deadline=$(( $(date +%s) + DEPLOY_TIMEOUT_SECONDS ))

                            while [ "$(date +%s)" -lt "$deadline" ]; do
                                if curl -fsS "$APP_HEALTH_URL" >/tmp/personal-web-health-response.txt; then
                                    echo "Deployment verified at $APP_HEALTH_URL"
                                    head -c 500 /tmp/personal-web-health-response.txt || true
                                    exit 0
                                fi

                                sleep 5
                            done

                            echo "Deployment verification timed out after ${DEPLOY_TIMEOUT_SECONDS}s"
                            exit 1
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            mattermostSend(
                color: 'good',
                message: ":tada: 빌드 성공! 배포가 완료되었습니다.\n프로젝트: ${env.JOB_NAME} #${env.BUILD_NUMBER}\n이미지: ${env.IMAGE_VERSION}\n바로가기: ${env.BUILD_URL}"
            )
        }

        failure {
            mattermostSend(
                color: 'danger',
                message: ":rotating_light: 빌드 실패... 로그를 확인해주세요.\n실패 단계: ${env.FAILURE_STAGE}\n사유: ${env.FAILURE_REASON}\n프로젝트: ${env.JOB_NAME} #${env.BUILD_NUMBER}\n바로가기: ${env.BUILD_URL}"
            )
        }

        always {
            echo '빌드 완료. Buildx는 이미지를 직접 푸시하므로 로컬 이미지 정리가 불필요합니다.'
        }
    }
}
