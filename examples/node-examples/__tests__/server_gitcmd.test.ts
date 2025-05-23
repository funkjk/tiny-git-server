import { cleanup, getRepoName, startServer } from "../src/setup-test"
import dotenv from 'dotenv'
dotenv.config().parsed;
import {spawn} from "child_process"


import fs from 'fs';

const LOCAL_FS_PATH = "dist"

test("receive_pack_test_gitcmd", async () => {
    await fetch(`http://localhost:3000/init?repo=${getRepoName()}`, {method: "POST" })

    const editRepoPath = `${LOCAL_FS_PATH}/${getRepoName()}/edit`
    const readRepoPath = `${LOCAL_FS_PATH}/${getRepoName()}/read`

    await runCommand(`git -c init.defaultBranch=main clone http://localhost:3000/${getRepoName()} ${editRepoPath}`, ".")

    fs.writeFileSync(LOCAL_FS_PATH + "/" + getRepoName() + "/edit/test.txt", "testdata")
    await runCommand(`git add test.txt`, editRepoPath)
    await runCommand(`git -c user.name='foobar' -c user.email='foobar@example.com' commit -m 'addtest'`, editRepoPath)
    await runCommand(`git push`, editRepoPath)

    await runCommand(`git -c init.defaultBranch=main clone http://localhost:3000/${getRepoName()} ${readRepoPath}`, ".")

    const readText = fs.readFileSync(LOCAL_FS_PATH + "/" + getRepoName() + "/read/test.txt")
    expect(readText.toString("utf8")).toBe("testdata")


    fs.writeFileSync(LOCAL_FS_PATH + "/" + getRepoName() + "/edit/test.txt", "testdata update")
    await runCommand(`git add test.txt`, editRepoPath)
    await runCommand(`git -c user.name='foobar' -c user.email='foobar@example.com' commit -m 'updatetest'`, editRepoPath)
    await runCommand(`git push`, editRepoPath)

    await runCommand(`git pull`, readRepoPath)

    const updatedText = fs.readFileSync(LOCAL_FS_PATH + "/" + getRepoName() + "/read/test.txt")
    expect(updatedText.toString("utf8")).toBe("testdata update")

}, 30 * 1000)

function runCommand(commandline:string, cwd?:string) {
    console.log("running commandline: %s", commandline);
    const parts = commandline.split(" ");
    const cmd = parts[0];
    const args = parts.splice(1);
    cwd = cwd?? `${LOCAL_FS_PATH}/${getRepoName()}`
  
    const child = spawn(cmd, args, {
      stdio: 'inherit', 
      cwd
    });
    return new Promise((resolve,reject) => {
        child.on('exit', (code, signal)=> {
            console.log("exit",{code, signal})
            resolve(code)
        })
        child.on('error', (err) => {
            console.log(err)
            reject(err)
        })
    })
  }

let server: any
beforeEach(async () => {
    await cleanup(getRepoName());
});
beforeAll(async () => {
    fs.rmSync(LOCAL_FS_PATH, { recursive: true, force: true })
    fs.mkdirSync(LOCAL_FS_PATH)
    server = await startServer(fs)
});
afterAll(async () => {
    await server.close()
});
