package com.commitlens.commitlensapi.provider.github.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import java.time.Instant

/*
* GitHub Repo JSON Structure:
* {
*  "id": 123456,
*  "name": "commitlens-api",
*  "full_name": "octocat/commitlens-api",
*  "owner": {
*    "login": "octocat"
*  },
*  "default_branch": "main",
*  "private": false,
*  "html_url": "https://github.com/octocat/commitlens-api"
* }
* */

// GitHub Owner: It contains the login name of the owner.
@JsonIgnoreProperties(ignoreUnknown = true)
data class GitHubOwnerDto(
    val login: String, // The login name of the owner of the repository.
)

// GitHub Repo: It contains the repository ID, name, full name, owner information, default branch, privacy status, and HTML URL.
@JsonIgnoreProperties(ignoreUnknown = true)
data class GitHubRepoDto(
    val id: Long, // The unique identifier of the repository.
    val name: String, // The name of the repository.
    @JsonProperty("full_name") val fullName: String, // The full name of the repository, including the owner's login name.
    val owner: GitHubOwnerDto, // The owner information of the repository.
    @JsonProperty("default_branch") val defaultBranch: String = "main", // The default branch of the repository.
    @JsonProperty("private") val isPrivate: Boolean, // Whether the repository is private or public.
    @JsonProperty("html_url") val htmlUrl: String, // The HTML URL of the repository on GitHub.
)

///////////////////////////////////////////////////////////////////////////////////

/*
* GitHub Commit JSON Structure:
* {
*   "sha": "a1b2c3d4e5f6",
*   "html_url": "https://github.com/octocat/commitlens-api/commit/a1b2c3d4e5f6",
*   "commit": {
*     "message": "Fix a bug",
*     "author": {
*       "name": "Octocat",
*       "email": "octocat@github.com",
*       "date": "2023-01-01T00:00:00Z"
*     }
*   }
* }
*/

// GitHub Git User: It contains the name, email, and date of the author of a commit.
@JsonIgnoreProperties(ignoreUnknown = true)
data class GitHubGitUserDto(
    val name: String, // The name of the author of the commit.
    val email: String?, // The email of the author of the commit.
    val date: Instant? // The date of the commit.
)

// GitHub Commit Detail: It contains the commit message and author information.
@JsonIgnoreProperties(ignoreUnknown = true)
data class GitHubCommitDetailDto(
    val message: String, // The commit message.
    val author: GitHubGitUserDto // The author information of the commit.
)

// GitHub Commit Item: It contains the SHA, HTML URL, and commit details.
@JsonIgnoreProperties(ignoreUnknown = true)
data class GitHubCommitItemDto(
    val sha: String, // The SHA of the commit.
    @JsonProperty("html_url") val htmlUrl: String?, // The HTML URL of the commit on GitHub.
    val commit: GitHubCommitDetailDto // The details of the commit.
)

///////////////////////////////////////////////////////////////////////////////////

/*
* GitHub Search Commits API JSON Structure:
* {
*   "total_count": 1,
*   "items": [
*     {
*       "sha": "a1b2c3d4e5f6",
*       "html_url": "https://github.com/octocat/commitlens-api/commit/a1b2c3d4e5f6",
*       "commit": {
*         "message": "Fix a bug",
*         "author": {
*           "name": "Octocat",
*           "email": "octocat@github.com",
*           "date": "2023-01-01T00:00:00Z"
*         }
*       }
*     }
*   ]
* }
*/

// GitHub Search Commits API: It contains the total count of commits found and a list of commit items.
@JsonIgnoreProperties(ignoreUnknown = true)
data class GitHubSearchCommitResponseDto(
    @JsonProperty("total_count") val totalCount: Int, // The total number of commits found in the search.
    val items: List<GitHubCommitItemDto> // The list of commit items found in the search.
)

///////////////////////////////////////////////////////////////////////////////////

/*
* GitHub Single Commit API JSON Structure:
* {
*   "sha": "6dcb09b5b57875f334f61aebed695e2e4193db5e",
*   "html_url": "https://github.com/octocat/commitlens-api/commit/6dcb09b5b57875f334f61aebed695e2e4193db5e",
*   "commit": {
*     "message": "feat(auth): CL-102 add jwt authentication filter",
*     "author": {
*       "name": "Octocat",
*       "email": "octocat@github.com",
*       "date": "2026-09-08T07:30:00Z"
*     }
*   },
*   "stats": {
*     "total": 45,
*     "additions": 38,
*     "deletions": 7
*   },
*   "files": [
*     {
*       "filename": "src/main/kotlin/com/commitlens/api/auth/JwtFilter.kt",
*       "status": "added",
*       "additions": 35,
*       "deletions": 0,
*       "changes": 35
*     },
*     {
*       "filename": "src/main/resources/application.yml",
*       "status": "modified",
*       "additions": 3,
*       "deletions": 7,
*       "changes": 10
*     }
*   ]
* }
*/

// GitHub File: It contains information about a file in the repository.
@JsonIgnoreProperties(ignoreUnknown = true)
data class GitHubFileDto(
    val filename: String,
    val status: String, // modified, added, removed
    val additions: Int = 0,
    val deletions: Int = 0,
    val changes: Int = 0,
//    val patch: String? = null // Git unified diff/patch content
)

// GitHub Stats: It contains statistics about a commit, including total changes, additions, and deletions.
@JsonIgnoreProperties(ignoreUnknown = true)
data class GitHubStatsDto(
    val total: Int = 0,
    val additions: Int = 0,
    val deletions: Int = 0
)

// GitHub Single Commit: It contains detailed information about a single commit, including SHA, HTML URL, commit details, stats, and file changes.
@JsonIgnoreProperties(ignoreUnknown = true)
data class GitHubSingleCommitDto(
    val sha: String,
    @JsonProperty("html_url") val htmlUrl: String?,
    val commit: GitHubCommitDetailDto,
    val stats: GitHubStatsDto = GitHubStatsDto(),
    val files: List<GitHubFileDto> = emptyList()
)
