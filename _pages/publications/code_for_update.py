for i in range(1993, 2026):
	newbib = open(f'/Users/wangzhe/Desktop/test/publication{i}.md', 'w')

	newbib.write('---\n')
	newbib.write('layout: page\n')
	newbib.write(f'permalink: /articles/{i}/\n')
	newbib.write(f'title: articles in {i}\n')
	newbib.write('nav: false\n')
	newbib.write('---\n\n')
	newbib.write('<hr/>\n\n')

	newbib.write('[all](https://wongzit.github.io/articles/)')
	for j in range(2025, 1992, -1):
		if j != i:
			newbib.write(f' / [{j}](https://wongzit.github.io/articles/{j}/)')
		else:
			newbib.write(f' / **{j}**')
	newbib.write('\n\n')

	newbib.write('<hr/>\n\n')
	
	newbib.write('<!-- _pages/publications.md -->\n\n')
	newbib.write('<!-- Bibsearch Feature -->\n\n')
	newbib.write('{% include bib_search.liquid %}\n\n')
	newbib.write('<div class="publications">\n\n')
	newbib.write('{% bibliography --group_by none --query @*[year=')
	newbib.write(str(i))
	newbib.write(']* %}\n\n')
	newbib.write('</div>\n\n')

	newbib.close()

'''
newbib = open('/Users/wangzhe/Desktop/paper2.bib', 'w')

for i in bib:
	if 'html={' not in i:
		newbib.write(i)

newbib.close()
'''


