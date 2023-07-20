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
    dependsOn(":jupyterlab-base:testImage")
    this.buildArgs.put(
        "BASE_CONTAINER",
        "${dockerInfo?.image}:${dockerInfo?.baseTag}-base-${this.project.getVersionForDocker()}"
    )
     this.buildArgs.put(
        "PYTHON310_IMG",
        "saagie/python:3.10-1.137.0"
    )
}
