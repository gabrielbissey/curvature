# Curvature.js
Curvature.js, or colloquially known in the developer community as just "Curvature", is a component-based, server-side code preprocessor. The name "Curvature" pays homage to Angular, with which I really came into my own as a developer.

## System Requirements
- Node.js (I'm using v17.1.0)
- NPM (I'm using v8.17.0)

## Setup
- Clone this repo
- Inside this repo, run `npm install`

## Using Curvature
Using Curvature is very simple. There are 3 things you must do: create components, create configurations for them, and then use them.

### Creating Components
Components live under the `components` directory of your project. Component files are simple html files that contain the component code.

Components may be as simple or complex as you'd like. Components are *complete* snippets of HTML code. An example of some component code may be as simple as
```html
<div>Hello</div>
```

So as a complete example, you may have a file called `hello.html`, which lives under `components`, and whose contents are
```html
<div>Hello</div>
```

### Configuring Components
Create a file called `curvature-config.json` at the root of your project. So far, this is a very simple file. If we're continuing with the above example of your `hello.html` file, you may configure a corresponding component as such
```json
{
  "components": {
    "hello": "hello.html"
  }
}
```

You then have configured your `hello` component to use in your project. The name of the component doesn't have to match the filename, necessarily. But I would recommend doing so for consistency.

### Using Components
Once you have created and configured your components, you may then use them. Using components is simple. All you have to do is insert a component tag in the desired location in an HTML document in your project. Component tags are formed as
```html
<curvature-{component name}/>
```
So continuing with the example of our `hello` component, a corresponding component tag would look like
```html
<curvature-hello/>
```

Now, you may insert your component tag where ever you'd like. Lets say you have a file called `index.html` and you would like to use your `hello` component inside it, you may do so like this
```html
<!DOCTYPE html>
<html>
  ...
  <curvature-hello/>
  ...
</html>
```

After running Curvature, the final, output file will look like this
```html
<!DOCTYPE html>
<html>
  ...
  <div>Hello</div> <!-- Your interpolated component! -->
  ...
</html>
```

### Running Curvature
Once you have done everything specified for creating/configuring components, you can run Curvature with
```bash
node <path to this repo>/curvature <path to your curvature project>
```

After running Curvature, you should find a `curvature-output` directory generated in your project. This directory is an exact copy of your project, just with all your components being interpolated. This is finished code now!

## Curvature Project Structure
Curvature can be as simple or complex as you'd like. At a minimum, your project needs to have these things:
```
| - curvature-config.json
| - /components
  | - example-component1.html
  | - example-component2.html
  | ... more components
```
Though I suppose such a project isn't particularly interesting, as you're just creating some components, but not using them. In reality, your project can look however you'd like. Curvature will copy your existing project over, verbatim, and interpolate your components as desired.

## Why Curvature?
I wrote Curvature for one simple reason: by and large, we've lost the art of making frontend applications fast. We've chosen to prefer developer comfort over code quality and minimizing code bloat. Do you really need Angular to write a blog website? Loading the whole framework just to render some components and do a little bit of logic? I don't think so.

## Known Issues/Shortcomings
- Components cannot be used in other components.
- Components are simply static templates; there is no way to dynamically interpolate data into a component.
