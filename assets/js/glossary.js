document.addEventListener("DOMContentLoaded", function(){

  const glossary = window.GLOSSARY || {};

  const content = document.querySelector(".post-content");

  if(!content) return;

  let html = content.innerHTML;

  Object.keys(glossary).forEach(term => {

    const url = glossary[term];

    const regex = new RegExp("\\b(" + term + ")\\b","gi");

    html = html.replace(
      regex,
      `<a class="glossary-link" href="${url}">$1</a>`
    );

  });

  content.innerHTML = html;

});
