const { Octokit } = require("@octokit/rest");
const fs = require("fs");
const { get } = require("http");
const octokit = new Octokit();
let queries = ""
console.log("Reading earch queries 🔍")
try {
  var text = fs.readFileSync("./companies.txt").toString('utf-8');
  queries = text.split("\n");
} catch(e) {
  console.log("Error: ",e)
}

let getUserNames = (items) => {
  let usernames = items.map(item => item.login)
  return usernames
}

let getUsers = async (q, page, per_page) => {
  const {data} = await octokit.rest.search.users({
      q,
      per_page,
      page
    })
  return {items: data.items,cnt: data.total_count}
}

let getAllUsers = async (q) => {
  let users = []
  per_page = 100
  page = 1 
  let {items, cnt} = await getUsers(q, page, per_page);
  users = users.concat(getUserNames(items))
  total_pages = Math.ceil(cnt/per_page);
  console.log(page);
  while (page < total_pages) {
    page += 1
    console.log(page);
    let {items,cnt} = await getUsers(q, page, per_page);
    users = users.concat(getUserNames(items))
  }
  return users
}

for (let q of queries) { 
  console.log(`Searching users 💻 at: ${q}`);
  getAllUsers(q).then((users)=> {
    console.log(`Found ${users.length} 👱🏾‍♂️ at ${q}`);
    fs.writeFileSync(`./users/${q}.txt`, users.join("\n"))  
  })
}

