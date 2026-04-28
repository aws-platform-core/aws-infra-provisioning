import { Octokit } from "@octokit/rest";
const githubToken = process.env.GITHUB_TOKEN;
const githubOwner = process.env.GITHUB_OWNER;
const githubRepo = process.env.GITHUB_REPO;
const githubBaseBranch = process.env.GITHUB_BASE_BRANCH;
if (!githubToken || !githubOwner || !githubRepo) {
    throw new Error("Missing GitHub configuration");
}
const config = {
    token: githubToken,
    owner: githubOwner,
    repo: githubRepo,
    baseBranch: githubBaseBranch,
};
const octokit = new Octokit({ auth: config.token });
export async function getResolvedBaseBranch() {
    if (config.baseBranch) {
        return config.baseBranch;
    }
    const { data } = await octokit.repos.get({
        owner: config.owner,
        repo: config.repo,
    });
    return data.default_branch;
}
export async function getBaseBranchSha() {
    const branch = await getResolvedBaseBranch();
    const { data } = await octokit.git.getRef({
        owner: config.owner,
        repo: config.repo,
        ref: `heads/${branch}`,
    });
    return {
        branch,
        sha: data.object.sha,
    };
}
export async function createBranch(branchName, sha) {
    await octokit.git.createRef({
        owner: config.owner,
        repo: config.repo,
        ref: `refs/heads/${branchName}`,
        sha,
    });
}
async function getFileSha(path, branch) {
    try {
        const { data } = await octokit.repos.getContent({
            owner: config.owner,
            repo: config.repo,
            path,
            ref: branch,
        });
        if (!Array.isArray(data) && "sha" in data) {
            return data.sha;
        }
        return undefined;
    }
    catch (error) {
        if (error?.status === 404) {
            // Expected for a brand new file on a newly created branch
            return undefined;
        }
        console.error(`Unexpected GitHub error while fetching file SHA for '${path}' on branch '${branch}'`, error);
        throw error;
    }
}
export async function upsertFile(path, content, branch, message) {
    const sha = await getFileSha(path, branch);
    await octokit.repos.createOrUpdateFileContents({
        owner: config.owner,
        repo: config.repo,
        path,
        message,
        content: Buffer.from(content).toString("base64"),
        branch,
        sha,
    });
}
export async function createPullRequest(branchName, title, body) {
    const baseBranch = await getResolvedBaseBranch();
    const { data } = await octokit.pulls.create({
        owner: config.owner,
        repo: config.repo,
        title,
        head: branchName,
        base: baseBranch,
        body,
    });
    return {
        number: data.number,
        url: data.html_url,
    };
}
