/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * Copyright 2019 Pierre Leresteux.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import com.bmuschko.gradle.docker.DockerRemoteApiPlugin
import com.saagie.technologies.SaagieTechnologiesGradlePlugin
import com.saagie.technologies.readDockerInfo
import com.saagie.technologies.getVersionForDocker


apply<DockerRemoteApiPlugin>()
apply<SaagieTechnologiesGradlePlugin>()

val dockerInfo = readDockerInfo(projectDir)

tasks.register<Copy>("prepareSparkPythonBuild") {
    val pythonVersion = "2.7"
    from(file("$buildDir/../spark-2.4-python/context.yaml.template"))
    into(file("$buildDir/context.yaml"))

    from("$buildDir/../spark-2.4-python/Dockerfile", "$buildDir/../spark-2.4-python/entrypoint.sh", "$buildDir/../spark-2.4-python/image_test.yaml")
    into("$buildDir")
}


tasks.withType(com.bmuschko.gradle.docker.tasks.image.DockerBuildImage::class) {
    dependsOn(":spark-2.4-python-2.7:prepareSparkPythonBuild")
    dependsOn(":spark-2.4:testImage")
    this.buildArgs.put(
        "base_img",
        "saagie/python:2.7.202005.84"
    )
    this.buildArgs.put(
        "spark_base_img",
        "${dockerInfo?.image}:spark-2.4-${this.project.getVersionForDocker()}"
    )
}

