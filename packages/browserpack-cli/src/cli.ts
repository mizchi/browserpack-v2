// TODO
import "isomorphic-unfetch";
import path from "path";
import glob from "glob";
import { compile } from "browserpack";
import fs from "fs";

function createMemoryObject(cwd: string, baseDirectory: string) {
  const files = glob.sync(`${baseDirectory}/**`, {
    root: cwd,
    cwd: cwd,
    nodir: true
  });
  const fileMap = files.reduce((acc, fname) => {
    const content = fs.readFileSync(path.join(process.cwd(), fname));
    const pathname = path.join("/", fname);
    return { ...acc, [pathname]: content.toString() };
  }, {});
  return fileMap;
}

async function build(options: { type: "memory" | "local"; input: string }) {
  switch (options.type) {
    case "memory": {
      const target = path.join(process.cwd(), options.input);
      const dirname = path.basename(path.dirname(target));
      const files = createMemoryObject(process.cwd(), dirname);
      const bundle = await compile({
        useInMemory: true,
        files,
        input: options.input
      });
      const out = await bundle.generate({ format: "esm" });
      console.log(out.output[0]);
      break;
    }
    case "local": {
      const out = await compile({
        useInMemory: false,
        input: options.input,
        cwd: process.cwd(),
        fs: fs.promises
      });
      console.log(out);
    }
  }
}

build({ type: "memory", input: "example_src/index.js" });
