  const articles = [];

        if (window.location.search) {
            const params = new URLSearchParams(window.location.search);
            if (params.has('a'))
                loadArticle(params.get('a').replaceAll('-', ' '));
            else
                loadArticleList();
        } else {
            loadArticleList();
        }

        function loadArticle(path) {
            document.getElementById('article').style.display = null;
            document.getElementById('homepage').style.display = 'none';

            const articlesEndpoint = 'https://api.github.com/repos/2ee4jnufew/Loptomp/contents/articles/' + path;
            window.fetch(articlesEndpoint).then(d => d.json()).then(
                data => {
                    const container = document.getElementById('article-content')
                    container.innerHTML = markdownit().render(atob(data.content));
                    document.getElementById('title-header').innerText = data.name.split('.')[0];

                    const article = {
                        localPath: 'articles/' + data.name
                    }
                    getDate(article, date => {
                        const elem = document.getElementById('date-display');
                        elem.innerText = date.toLocaleDateString();
                        elem.title = date.toString();
                    });
                }
            );
        }

        async function loadArticleList() {
            const articlesEndpoint = 'https://api.github.com/repos/2ee4jnufew/Loptomp/contents/articles';
            const data = await (await window.fetch(articlesEndpoint)).json();

            for (const entry of data) {
                const article = {
                    id: entry.name.replaceAll(' ', '-'),
                    name: entry.name.split('.')[0],
                    fetch: entry.download_url,
                    localPath: entry.path
                };

                await getDateAsync(article);

                articles.push(article)
                articles.sort((a, b) => b.date.getTime() - a.date.getTime());
                generateListElement();
            }
        }

        async function getDateAsync(article) {
            const endpoint = `https://api.github.com/repos/2ee4jnufew/Loptomp/commits?per_page=1&path=${article.localPath}`;
            const response = await window.fetch(endpoint);
            const data = await response.json();

            if (data.length > 0) {
                article.date = new Date(data[0].commit.committer.date);
            }
        }

        function getDate(article, action) {
            const endpoint = `https://api.github.com/repos/2ee4jnufew/Loptomp/commits?per_page=1&path=${article.localPath}`;
            window.fetch(endpoint).then(d => d.json()).then(
                data => {
                    if (data.length > 0) {
                        article.date = new Date(data[0].commit.committer.date);
                        if (action)
                            action(article.date);
                    }
                }
            );
        }

        function generateListElement() {
            document.getElementById('homepage').style.display = null;
            document.getElementById('article').style.display = 'none';

            const container = document.getElementById('article-list');
            container.innerHTML = '<b class="proj">Projects</b>';

            for (const article of articles) {
                const link = document.createElement('a');
                link.href = '/Loptomp?a=' + article.id;
                link.innerText = article.name;
                container.append(link);
            }
        }
