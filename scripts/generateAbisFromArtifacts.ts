import fs from 'fs';
import path from 'path';

//read destination directory submitted as first param
var destination = process.argv.slice(2)[0];

//read all contract artifacts from artifacts.json which should be in the directory from where script should be executed
const artifactContent = fs.readFileSync('./artifacts.json', 'utf-8');

const artifacts: string[] = JSON.parse(artifactContent);

(async function () {
  for (const artifact of artifacts) {
    console.log(artifact)
    let content;
    try {
      //try to import from node_modules
      content = JSON.stringify(await import(artifact));
    } catch (e) {
      //try to read as path on disc
      content = fs.readFileSync(artifact, 'utf-8');
    }
    const filename = path.basename(artifact, '.json');
    //create and write typescript file
    fs.writeFileSync(path.join(destination, filename + '.ts'), `const artifact = ${content.trimEnd()} as const; export default artifact;`);
  }
})();