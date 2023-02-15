/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * Copyright 2019-2021.
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

tasks.withType(com.bmuschko.gradle.docker.tasks.image.DockerBuildImage::class) {
    dependsOn(":spark-3.1:testImage")
    this.buildArgs.put(
        "base_img",
        "saagie/python:3.7-1.143.0_SDKTECHNO-214"
    )
    this.buildArgs.put(
        "spark_base_img",
        "${dockerInfo?.image}:3.1-${this.project.getVersionForDocker()}"
    )
}

