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

tasks.withType(com.bmuschko.gradle.docker.tasks.image.DockerBuildImage::class) {
    dependsOn(":jupyter-python-3.6-minimal:testImage")
    this.noCache.set(nocache?.toBoolean() ?: true)
    this.buildArgs.put(
        "BASE_CONTAINER",
        "saagie/jupyter-python-nbk:python-3.6-minimal-${this.project.getVersionForDocker()}"
    )
}