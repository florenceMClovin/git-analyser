const { Octokit } = require("@octokit/rest");
const fs = require("fs");
const octokit = new Octokit();
const per_page = 100
var currentDateTime = new Date();

const limit_per_minute = 10;
var global_req_count = 0;
var latest_time = currentDateTime.getTime();


function waitforme(milisec) {
  return new Promise(resolve => {
    setTimeout(() => { resolve('') }, milisec);
  })
}
 

let getRepos = async (username, page, per_page) => {
  currentDateTime = new Date();
  if (global_req_count == limit_per_minute) {
    if (latest_time + 60000 > currentDateTime.getTime()) {
      let time_left = latest_time + 61000 - currentDateTime.getTime()
      console.log(`Waiting for ${time_left/1000} seconds`);
      await waitforme(time_left); 
    }
    currentDateTime = new Date();
    latest_time = currentDateTime.getTime();
    global_req_count = 0;
  }

  const {data} = await octokit.rest.repos.listForUser({
    username,
    per_page,
    page
  })
  global_req_count ++;

  return {items: data,cnt: data.length}
}

let getAllRepos = async (user) => {
  let repos = []
  page = 1 
  cur = per_page
  while (cur == per_page) {
    let {items,cnt} = await getRepos(user, page, per_page);
    items = items.map(item => [user, item.id, item.language])
    repos = repos.concat(items)
    cur = cnt
    page += 1
  }
  return repos
}

let searchAllRepos = async (com) => { 
  fs.writeFileSync(`./repos/${com}.txt`, "username, repoid, lang\n") 
  console.log("Reading usernames 🔍")
  let users = ""
  try {
    var text = fs.readFileSync(`./users/${com}.txt`).toString('utf-8');
    users = text.split("\n");
    users = users.map(u => 
      u.trim()
    ).filter(
      u => (u.length > 0)
    )
  } catch(e) {
    console.log("Err ❌ ",e)
  }
  console.log(`Found ${users.length} users`);

  let repos = []
  for (let u of users) { 
    let new_repos = await getAllRepos(u)
    repos = repos.concat(new_repos)
    console.log(`+ ${new_repos.length}`);
  }
  console.log(`Found ${repos.length} repos for ${com}`);
  fs.appendFileSync(`./repos/${com}.txt`, repos.join("\n")) 
}


let com = 'palantir'
var args = process.argv.slice(2);
com = args[0]


searchAllRepos(com)

//TODO:
/*
  - authenticated requests
  - wait for rate limit ✅
  - get command line company argumnent
  - get all repos for each of the companies
*/
