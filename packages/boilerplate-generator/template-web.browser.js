import template from './template';

const sri = (sri, mode) =>
  (sri && mode) ? ` integrity="sha512-${sri}" crossorigin="${mode}"` : '';

export const headTemplate = ({
  css,
  htmlAttributes,
  bundledJsCssUrlRewriteHook,
  sriMode,
  head,
  dynamicHead,
}) => {
  var headSections = head.split(/<meteor-bundled-css[^<>]*>/, 2);
  var cssBundle = [
    ...(css || []).map((file) =>
      template(
        '  <link rel="stylesheet" type="text/css" media="print" onload="this.media=\'all\'" class="__meteor-css__" href="<%- href %>"<%= sri %> /><noscript><link rel="stylesheet" type="text/css" class="__meteor-css__" href="<%- href %>"<%= sri %>></noscript> '
      )({
        href: bundledJsCssUrlRewriteHook(file.url),
        sri: sri(file.sri, sriMode),
      })
    ),
  ].join("\n");

  return [
    "<html" +
      Object.keys(htmlAttributes || {})
        .map((key) =>
          template(' <%= attrName %>="<%- attrValue %>"')({
            attrName: key,
            attrValue: htmlAttributes[key],
          })
        )
        .join("") +
      ">",

    "<head>",

    dynamicHead,

    headSections.length === 1
      ? [cssBundle, headSections[0]].join("\n")
      : [headSections[0], cssBundle, headSections[1]].join("\n"),

    "</head>",
    "<body>",
  ].join("\n");
};

// Template function for rendering the boilerplate html for browsers
export const closeTemplate = ({
  meteorRuntimeConfig,
  meteorRuntimeHash,
  rootUrlPathPrefix,
  inlineScriptsAllowed,
  js,
  additionalStaticJs,
  bundledJsCssUrlRewriteHook,
  sriMode,
}) => [
  '',
  inlineScriptsAllowed
    ? template('  <script defer type="text/javascript">__meteor_runtime_config__ = JSON.parse(decodeURIComponent(<%= conf %>))</script>')({
      conf: meteorRuntimeConfig,
    })
    : template('  <script defer type="text/javascript" src="<%- src %>/meteor_runtime_config.js?hash=<%- hash %>"></script>')({
      src: rootUrlPathPrefix,
      hash: meteorRuntimeHash,
    }),
  '',

  ...(js || []).map(file =>
    template('  <script defer type="text/javascript" src="<%- src %>"<%= sri %>></script>')({
      src: bundledJsCssUrlRewriteHook(file.url),
      sri: sri(file.sri, sriMode),
    })
  ),

  ...(additionalStaticJs || []).map(({ contents, pathname }) => (
    inlineScriptsAllowed
      ? template('  <script defer><%= contents %></script>')({
        contents,
      })
      : template('  <script defer type="text/javascript" src="<%- src %>"></script>')({
        src: rootUrlPathPrefix + pathname,
      })
  )),

  '',
  '',
  '</body>',
  '</html>'
].join('\n');
