const { Octokit } = require("@octokit/rest");
const fs = require("fs");
const { get } = require("http");
const octokit = new Octokit();
let queries = ""
console.log("Reading search queries 🔍")

try {
  var text = fs.readFileSync("./companies.txt").toString('utf-8');
  queries = text.split("\n");
  queries = queries.map(item => item.trim().split(/\s+/))
} catch(e) {
  console.log("Error: ",e)
}
console.log(queries)

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
  cur = 100
  while (cur == per_page) {
    let {items,cnt} = await getUsers(q, page, per_page);
    usernames = getUserNames(items)
    users = users.concat(usernames)
    cur = usernames.length
    page += 1
  }
  return users
}

let searchAllQueries = async (queries) => {
  for (let q of queries) { 
    let users = []
    for (let q_alt of q) {
      console.log(`Searching users 💻 at: ${q_alt}`);
      let new_users = await getAllUsers(q_alt)
      users = users.concat(new_users)
    }
    users = [...new Set(users)];
    console.log(`Found ${users.length} 👱🏾‍♂️ at ${q[0]}`);
    fs.writeFileSync(`./users/${q[0]}.txt`, users.join("\n")) 
  }
}   

searchAllQueries(queries)