const { Octokit } = require('@octokit/rest');

class AutomationService {
  
  async runTask(taskType, details, credentials) {
    console.log(`Starting task: ${taskType}`);
    
    if (!credentials) {
       throw new Error("No credentials provided for this user.");
    }

    switch (taskType) {
      case 'github_post':
        return this.postToGithub(details, credentials);
      case 'instagram_post':
        return this.postToInstagram(details, credentials);
      default:
        throw new Error(`Unknown task type: ${taskType}`);
    }
  }

  async postToGithub(details, credentials) {
    const { code, repoName, fileName } = details;
    const { service_username, service_password } = credentials; // service_password MUST be a PAT

    console.log(`Executing GitHub Post for ${service_username}/${repoName}...`);

    try {
        const octokit = new Octokit({
            auth: service_password // Personal Access Token
        });

        const owner = service_username;
        const repo = repoName;
        const path = fileName;
        const content = Buffer.from(code).toString('base64');
        const message = `Automated upload: ${fileName}`;

        // 1. Get existing file SHA (if it exists) to update, or null to create
        let sha;
        try {
            const { data } = await octokit.repos.getContent({ owner, repo, path });
            sha = data.sha;
        } catch (err) {
            // File doesn't exist, ignore error
        }

        // 2. Create or Update file
        const result = await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message,
            content,
            sha, // Include SHA if updating
            committer: {
                name: 'KittyAI Automation',
                email: 'automation@kittyai.com'
            }
        });

        console.log('GitHub Action Success:', result.data.commit.html_url);
        return { success: true, url: result.data.commit.html_url };

    } catch (e) {
        console.error('GitHub Automation Failed:', e.message);
        throw new Error(`GitHub Error: ${e.message}`);
    }
  }

  async postToInstagram(details, credentials) {
    const { imageUrl, caption } = details;
    const { service_username, service_password } = credentials;

    console.log(`Simulating Instagram Post for ${service_username}...`);

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
      await page.goto('https://www.instagram.com/');
      console.log('Navigated to Instagram');
      
      // Simulation
      console.log(`[Mock] Uploaded image ${imageUrl} with caption: "${caption}"`);

    } catch (e) {
      throw e;
    } finally {
      await browser.close();
    }
    
    return { success: true };
  }
}

module.exports = { AutomationService };
