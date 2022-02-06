const { Octokit } = require("@octokit/rest");
const fs = require("fs");
const octokit = new Octokit();
let queries = ""
const per_page = 100

console.log("Reading search queries 🔍")

try {
  var text = fs.readFileSync("./companies.txt").toString('utf-8');
  queries = text.split("\n");
  queries = queries.map(q => 
    q.trim()
    .split(/\s+/)
    .filter(
      q_alt => q_alt.length > 0
    )
  ).filter(
    q => (q.length > 0)
  )

} catch(e) {
  console.log("Err ❌ ",e)
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
  page = 1 
  cur = per_page
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
    console.log(`Found ${users.length} 🥸 at ${q[0]}`);
    fs.writeFileSync(`./users/${q[0]}.txt`, users.join("\n")) 
  }
}   

searchAllQueries(queries)