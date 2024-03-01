const sh = require("shelljs");
const path = require("path");
const fs = require("fs");
const os = require("os")

const distDirPath = path.resolve(__dirname, "..", "dist");
const packageJson = require(path.resolve(__dirname, "..", "package.json"));

const version = packageJson["version"];
const name = packageJson["name"];
const targetFilePaths = [`${name} Setup ${version}.exe`, `${name} Setup ${version}.exe.blockmap`, "latest.yml"].map(name => {
	const filePath = path.join(distDirPath, name);
	if (!fs.existsSync(filePath)) {
		console.error(`Not Found: ${filePath}`);
		process.exit(1);
	}
	return `"${filePath}"`;
});

const changelog = fs.readFileSync(path.resolve(__dirname, "..", "CHANGELOG.md")).toString();
const matches = changelog.match(new RegExp(`## ${version}(.*?)(?=## \\d|\\Z)`, 'gs'));
const tmpChangelogPath = path.join(os.tmpdir(), `changelog-${Date.now()}.md`);
fs.writeFileSync(tmpChangelogPath, matches[0].replace(`## ${version}`, '').trim());

sh.exec(`echo ${process.env.GITHUB_CLI_TOKEN} | gh auth login --with-token -h github.com`);
sh.exec(`gh release create "v${version}" -t "Release v${version}" --target "main" -F "${tmpChangelogPath}"`);
sh.exec(`gh release upload "v${version}" ${targetFilePaths.join(" ")}`);