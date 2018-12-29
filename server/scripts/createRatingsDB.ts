import { JSDOM } from "jsdom";
import { MovieModel } from "../services/movie/model";
import { ReviewModel } from "../services/review/model";

const criticsInfo = [
  {
    name: "idlebrain",
    image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxIQEBUSEhIVEBIRFRUYFhIYFxUVFxUWFRYWFxgWFRgYHCkgGBolGxUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGhAQGy0lHx0rLS0tLS0rKy0tLSstLS0tLS0tKystLS0tLSstLS0tLS0tLS0tLS0tLS0tLS0tLTc3Lf/AABEIAOEA4QMBEQACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABgcBBAUCAwj/xAA+EAACAQMCBAMEBggFBQAAAAAAAQIDBBEFIQYSMVEHE0EUImFxMoGRobHBIzNCUmNywtFTYpKy8QgXJCVz/8QAGwEBAAIDAQEAAAAAAAAAAAAAAAEDAgQFBgf/xAArEQEAAgIBBAEDBAEFAAAAAAAAAQIDEQQFEiExQRNRYRQiMnGBFSMkMzT/2gAMAwEAAhEDEQA/ALxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADADJEyGR8DDZMflOjIYxP3ZQSyAAAAAAAAAAAAAAAAAAAAAAAAAAHlkfKGvdXKpxyzX5PIrhrtbjxd0uTa60+fEvovo+xxsHVZvl1LbycTtruHSvr+FGDnJ4iln59sHf74mNw1ceG2S3bCu34hzhcvK5qOcOPqviu5R9bzp6GejVnDuPax9PvY1qcakHmMllGzE7h5zJjnHaay2yWAAAAAAAAAAAAAAAAAAAAAAAAwRAw2SNW7vqdNe9KKfom0inNfsrtNdWn2jl/eupLZ5R5Dncq+S/a7GDDWI2+NvVpQzKpUjHl3w5LP1LJs9P6ba090q83JjfZEobxhxK68uSDxCPTHY9BM9kdsO907gRSvdPuWlwtw9O6qrZ4W+fzZVXHudrebzI41Zhc2l2EKFNQisJfe+5v1jUPGZs05bzZumSoyAyCTIBsI2IJZAwBhsaRsyDe2QMhIAAAAAAAAAAYIkRvi7U6lNU6NHCrXEuWMv3V6yLaR8qrz8NKnwDayj/wCQ516j3c5SfV9eXsV5bxbxori152juq8JXVtWhRta0nb3Dw+beVHG7w+2DR/QY7X7phZbJkiNRKQQ8OrDy+SpCVWTW85SfM33XZm9XVI7asIpMed+UA1bgqVjf0aMJSqWt1JqDl1pySzyt+qwYzii0adjidUtgrq0rUtrelYUUljmxv3b/ALGWOmmvmy35N9z6aWm8SPn5Z/Rb2fYutj1DG+DUeEphLKyVS1pgyQx+XipWS6shnFJlEbPjR1NQla8iUFJxUvXK7ow7vOnTv02Y4/1UxyWuV+GckIg5glhsMZ38NBaxQc3TVWHOtnHKymR3Nn9Pl7d6cvjHiN2VGM4RU5Tkksvb1efuIm2mxwOF+ovNfs8T4zt6NlSurmXkwq7dG/e7ExO2vysP0ck0+zp8Pa/Qv6XnW0/Mp5cc4a3XXqSodKdRRWW1Fd28AfP2un/iQ/1R/uB9KdaMvoyUvk0/wA9SlgBGQGQMAeZVUurSz0y0sgegPM6iSy+iK8l4pG5TWO6fCAcV6mqd5bXMv1VKTjP4KX7Rz8PUYvkmsLb8fXmUzcKddU5qTkotSi4y2frvjqvgdOPPlRpGeLOObeyurejKSk5yfPh58tPZN9tyyIWRi35SV06VZ06ylzcmXGSk+XdeuNmYa1LHWlZeKPEqleWtC2anUtqjqVMbpbYUXj5sd2mzg40ZLeW3d647hKc3yZW6bx9nwNrHXcNi1aY/Dr8LWkbhuakpRi8Noxyzpr35HxCU6tcu3t5zgsuEW0vTZGvZhx8f1ckRb5VPecd3tVbTVNdor+5RbLPqHr8PRsFPbzonttxcU5vzakYzTeW1HBFe75Ry68PDimsfyT6woaer11ITi7iTacc9JYw9u5dGtvP5b8r6HbMftRXifiq6jeSpQqclOE4rCS77rJha/l1eJ07DPH7596WjbSzCL7pMtifDzGSurTCu7ziurT1Xkcv0MZcjj8/X6ivv8vQ06bW3D74jynmpXapUJ1H0jFvP4FlpcHBjm2SKflQdxXc6kptvmm3Lr3f/AAalp8vodMNIxxTXws+grWtptCN3PlTimm3vlfE2ImJjy8nb6+Pl3+jCJeOMqUdKtY0MOl5vuteqUTKutOTn+pN7Tk9qy0Crqvsk3aSrRtqGZTcHyxT9cslQzHiu7rWNahVqzqxzCak5PMd8YT7AeuHeEdUv4KpQjUdNvCqOcox2675Auzwk4RutM872qrGc63LyxU+Zrlznr8wPn46cRytbBUqc3CrcywmnhqMd5fIDS8DuNHd0XaV581agswk3vOH5tAS/i/jyz0vEa826klmNOKzJrLw/gtgKn4i8c7ipmNpRjQj/AIknzz+pbJAQmy13Ub67py8ytcTjOL5VnCWey2SA/T/NV/dkBu39FTg03y/E1uRhnJWYhljyxjnauNazOboyWYv600crh9JvTPMseV1Cva1uHtMcL2lbwq1Y0JxlJwU5JbLosPZHq5wxjxtHBltklL6/h5ps5OUraM5S6yk5Nv5vO5p1vt0a5JhuW/B9pTh5cKcoQxjljUqJY7YTImUTO52rj/thXhXqOjcU6VGpUbWXmoo5e2/UzpEfK2ORNY8JVY+GNqmnXnUuWvSUmo/Zks+trxDXtNrTuW34fWsaPtNOnFRhGvJRivREZfMRKnHM7lIddp81tVXeEvwZRb03+LaYy1/tRmi3UKNaM6kPNjDPubPLw+5rVnUve8jFbLi7KTrfytvhLiKN7Tny0vK8vbG2+V8DYi0S8bzuHbj5I7p3tAuFnnVs/wCef4srj+T0PNiI4P8AhzOIp819Vf8AF/Mwt7bPBpH6T/C7rN4pQ/kX4GxH8Xh8kbyT/aiNbqOdzWlv+slv2xJ4NWf5Pe8SIrgpSfmEp1fifzdLhTz+kk1CXfES2beHL4/T+zmzb4QjBTLv/KSa9UzYWa7KX3YRdPpx+JX/AJd9ub4pr/0lh/8AR/7WWU9PM9T/APRZXtnxdc0rCVhSahSqybm19KSe/L8jJoJna8ETtdAubuqkqtdQcY9eWnF9X6bgQvTuNL+2t1b0bmdKkm2oxwms9d+oEy8HLm8r6tTqVp16sOSeZzdSUfT1ewHz8WNXhf63GhKooUKEo0nNv3VunUf4oCMUL2Ol6qqltVVWlRq+7OLbUqb6p99n9wFieLmh3Wq3NrVs6Eq0KlCL51jlWW+rb9MgVpxhwnX0upCnXcXOcObEXlL4ZA/RPhFpdvS0uhUo01GdaClOePelL1ywJqBGuJ9SlD3EnFP17m9xccS5fMzWiPEI7Y0ZVppJZz6m3ktGL4c3HW2WfLp6j5dhc0KtR4hyuMpY6N5Obl5MWjUy9HxuJbXiHftOIretDnpTdSKeHKMXjJrRaPhdbHMe3y1Hii2t4qdWTpxzs2nv8CyuObeYYKyoWcr24rXXnVqVLzG6XvNbL1S9Da3Fa6lfi405PCR6JfXk8wo3cKsofsVVjPyfqVbrKORw8mOPCQ8H2Faj5zrxUZVKnNtun8iMkxPpqYqzE+Xb1JZozXeL/Apt6bPHn/cj+1S8E8PUryrUVSTXlvPKts7lFY8vX9R52TjYq9qz7DSaNpSkqUFBcry/V7epbMRp5XJysvJyxN1XcDe9qefjVf4lVZ/c9Z1K1P0ca/Di6pPN1Ul/Fb+rJjafLd40a4+vwt+Gv2yt1+mhlQ6Z36F8WjTx88LNOf8Aj8q64PsPa/aotZcqba7qWclNaxMy9Fzs88eMf9ovUg4txezTaZhb261LxesW+6RcSaX5FtayxvODcvreV+Rnb05/B5Ns2bJWfUemlqdfmtbeP7vmf0kTbazHjmua1mfFuGNFsF/n/pL6+njedO89lXapw3d2tOFWvQnSp1Mck3jDb3WMPsjJpphwTxBWrafe2FSbqQ9nnUp5eXBxW6T7AR/gTX7WxqzqXNqrtOKUIvGFJerygLO4U8VZVldSdvSt6NvRc4qC3T3Sy/UCobPSLu/qTqUaM68pylKTituaTy9/mwNfWdHr2dTyrilKjPGeV9n6gfoHwE4g9o0928nmdrJpfyS3j9+QIb/1G08XlvLvTkvsaAsLwMu/M0emvWnOcfqTQE/5QNTUbCFeHJNZ7P1TM6ZJpbcKsuKuSHPtbKFlScsczXrgjmcu3btHD4de5C9avnXcnPePr2PKZOVfJbUPY8fFXFT0+PCNW5p4pUm1bznlycHtn0Tx6nf4eOe3y4/Lis23Bxf7VWhSjXounGNSTlCKc1yQfuzbXTJ06TFYaVdTOnN1LWYzjGNF4hjr0Ksk9z0HE48du23wro9StVjKOYpb5WVj5lPbKzmcrHWnbMLYowaik23hde5k8tad23DNeHNFrumSY7dtolCeCOGK9rWqVaj5VLKUPhzNplda6drqPUKZsUU+yY6h+qn/ACv8DK3pyMP/AGRtVHh9bzV9JuMo+7U6prrnuU1rO3q+p5sU8ataz58NCfCl7VqSaoSScnu9iJpMy2qdV4+PHEb+HRo+HN245bhF9vUmMcteeu8eto0kPh7w9XtKlV1ocnMklvlPf4GWOmvbmdW6jTk0r2/EuJxTwpWd+/JpylTqNSbS2W++4tTy3uD1SleN+6fMQkvG3D1S5tqMKUczp8q7YWMMytXw5nTufGDLa8/Kvdd0SvbKFOcW37zzFNpZwU9j0XG5+LL3Tt9PGpcukWK6Pn/oNivp43mTvPafyrLVeI77UadKhUc60KCUYQhFvdLGWo9XglrLO8JfD6sra4r14OnO4pSp0oSTjJKS3k091noB9eGvAqKxK9rOX8Knsvrk9wJvqnhtZVLKVpRh7LGTT54fSbj05m+qA63BXDcNNs4W0HzcuXKeMOcm2239uPqAini14fz1R0alDljVhLlm308t+vxxgDvcB8DUNJpctPM6s0vMqv8Aaa7L0QHI8SPDyer17eXmqjTpRkpvGZPLT937AJHwZwrR0u38ii5Si5czcnndgd/AHoD5zgmmn0ZFqxaNJiZidwjd3wtCU3yvEZJ7dsnM/wBPrF9uhXn27dS9wtri3p8sZUlTh6tPodelYiNNaZ77ILxDxpeZlTpyp8rTTeG3h7faZadLj8Du8y5fCuhSrOMVukYS38meMFNLi0jTo0IKMV82Q87nzzktt0CFDIGAPMkCJ0+caMU8pJPuGU3mY8y+qDFlAZAwAYHyqUovqk/qQTGSavhd6fSqpRqU4zUXlJrKQRuZ8vVDT6MPoUoR+UUvyA2kBkAAAAAAAAAAwBjANotx5bXE6H6Dfl+lBdX8V3+RnVt8Tt7/ANyrdE0udxU5cPrv8/7lkzDv35FcdPErm4f0iFtDlS97Cy/l6FMvO8jPOSzqhrRDKIGQlgIAkBoAyAAAAMAAMgAAAAAAAAAAAAAAeZBE7+Glb6ZSp1HUjBRlLq0vXv8AMnayctprqW6kRtXD0EgAAAAAAAAAAAAAAAAAAAAAAAAAAAAGGgGACAyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf//Z",
    link: "http://www.idlebrain.com/movie/archive/index.html"
  },
  {
    name: "greatandhra",
    image: "data:image/png;base64,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",
    link: "https://www.greatandhra.com/reviews/"
  },
  {
    name: "123telugu",
    image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQDxAQEBAQEBAPEA8PEBAPDw8PDxAPFREWFhURFhUYHSggGBolGxUVITEhJSkrLi4uFx8zODMtNygtLjcBCgoKDg0OGhAPFysdGB4rKysrLS0tKy0tLS0rLSsrLTc3LTctNy03Ny03KzctLTctLSsrLSsrKysrKzcrLSsrK//AABEIAOEA4QMBIgACEQEDEQH/xAAcAAEAAQUBAQAAAAAAAAAAAAAABwECAwUGBAj/xAA+EAACAQIDBgIECwgDAQAAAAAAAQIDEQQFIQYHEjFBURNxImGBsRQVJDI0NUJykaHBIyUzUnN0wvAWYrKi/8QAGgEBAQEBAQEBAAAAAAAAAAAAAAECAwUEBv/EACIRAQADAAEEAwEBAQAAAAAAAAABAhEDBBIhURMUMSJxBf/aAAwDAQACEQMRAD8AnEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGLitqaWrtDGM3HscuTlrT9lNb8GpjnlBpNzsYnn9O8tdEuZn7FPZrdg09DP8PJfxFcuq57h4c6pqOakxuq2oNRDPKbTd9O5mWbUWtJ+0z9intNbEqaOttBTTsnfWxtMPWU1xJ6M1XmraciVegFsS46gAAAAAAAAAAAAAAAAAAAAAAADzVvmvyZwjrJzneK5s7fHytTk/UzgJvV2/mZ4vXzEMyyUuBS9Pl0MmKgnGbitEjz9dT24Wk3SrPpwnnUnulz1qk6apKz9KwwXgyi/Flr0PFCP5F710sXunF1scEk76/s7/kejFKGihLTqW4Oh+xkzHHRMk2muJr1PwvDWt5XOtyV/sYnDpcvM7jI3ejE+/octZustmkVKFT24bAAUAAAAAAAAAAAAAAAAAAAAAGvzb+Ezg5dfNnf5jG9OXkzgesvNnh9dGyxdSSOjwWG+SVH3gzn6EHKcUurO1lh+HDSiv5Wcui44nWa11GSTu0VStcy4qHC5W5osgrqK6uxw2O7HaaeHWYeh8jlLroaS+h2GFwvyRR7xuclWVpSXZnXqKRFYlxtVSL5I7nJFajE4aK9KPmjvsujanHyR2/50f01R7EVKIqe62AAAAAAAAAAAAAAAAAAAAAAAA82Kj6LXqZH9RcM5J87skOqvRfexwmbUeGpZ82zyOupM+YYuzZFhnOr5anaTjdOPqNVs9g+CCm+cjc2O3S8XZT/AFaR4RhnVNwrzXRsx5ZT4q0I92brbDBuNRVOjdzzbKYbxKyn0iz4Z4M5U2dd1Sp2gl2VjiMyocFSV+rZ3yj+RzW02C0410Pq6vi2nhqYaHCwcpx80SBho2ivJHG5FS46y9SO0irJE6DjmqQyIqURU9ZoAAAAAAAAAAFAGUuTyKi5RgeQKgDQBQAVAAFnW5pMflniV1O2isbxPQpfuc+Tji1ckmNUpxUUkuSKvqUX4l2prs8RA1W0ODdWi7K7sefZjLHRg21Zs3jeti1t9Nf0MW4om2pMLrGHG4dVIOL5NGd8i1vo3ZnS9YtGK0ez+AlTlJyjbV28jeQlfTqVuijduhmnH2wQyIqWxWhcdAAAAXBZP8wLkxcslbukIpgZAABbJlGxJFFr7Ce01Vsrcwta3uVk+xit2sZGyqaMcfxK8XSxYndJX3FyjKDYRddAsu+yA2Boqm2mBi7Orb8DJl+1ODxNTw6VTilzsQ1tLu8xlCDquTaX/a55t0NSXxlKLbdo25mpIfQ93flo+TPFmOaUMMr1alvaj11p8NOUnyjG581bwM7r4vHVKcZy4Iv0EnzdyiblvCyy9vG18jfZZmdHEx4qM1Jey5Akd2uKlg1ilzUeK19fwNfsLn2IweOpxlOXBe04t6AfTJqM22iwmFdq1RRdr9GZMwzRU8K8QuXBxL2o+ac1xGJzHGzjCUpSlNpK+nC2SN0T/htvsuqvhjV1vbkkdJSrxqQUoNST6nzhtNsHi8Dh4122o6NuL1udvuS2kqVpSws5N8EOLV6mpIS+ip5cdjoUI8VR2j3PJlu0GHxDcaU1JrmQbUFnFbmFL8+QF5hxPzJvlaEtfYX8f4GLFfw6n3Je4D51ltFi/jJQVepweOo24tLcR9F0leMNfsx9x8w1PrRf3C/9H0/RXoQ+7H3AZgW8Q4gEkWRdrlzPLVxcIS4ZSSb5aozaYj9WsNXn+KlGUYRerLo8dChdtycu77nlzqXymm/s2PZm2tBWfVHk2vMWv5fVFfFWshGsl4rm0r8rnsx2Ml4MGm7ydr9THr8F5q9+5iqprD078+M5Re3Z+/q5Hex1lWglJzlr6xN1Y8E+OVn0uenM/wCFTMeLi/Dpdjlt/btEx6XfGUu7BhtEqTb+2/59PRvAfyCp7fcQxufilmdS97+l7yZt4X0Cp/vQhjdEn8aTfn7z9G8tP+aq2GrWvfw37j5qwNGpPN6KlTlaVazbi7WufT84ppp8pKzNVHZ3DKoqiglUi7p2XMD042EaeFnFL0YwtY+Ysa08xqKPOVTS3mfRO3WZxw2BrttKpKD4fWz5/wBicI8XmVHiV+KV5PoBPmNwFSvlMKMPnSpRWvkRxsJsHi8PmXjVkvDu+hNFGjwQjBcopL8DHmWOp4em6tS0Yx5vkBzu8umnl8k+nfyIg3OSazSoly4f1Oo3l7wKFfDvD0E3NvnzR5Nx2S1FiKlepTkk4+i5KyuB229dr4FZT4ZLs7Mj3cfJyxNbjm7R5cUi/e58NljKlrrDpaaOzON2YlivGfwW97+la7A+p5SXPn5aljrwXOcU+zkkc1jM6ngsqjWqtKtGnez5tkJPPcxzCtKUHKV3dcF9APpONaL+bKMu/C7iuvQn9yXuZ897NbaY3AYuNLEt8EnZp37k/Uq6qUPEWqnScvxiB8y3/ei/uP8AM+oKTShFt29GPuPl+b/ea/uF/wCz6H2nrSp4GU4uzVK68+EDdRqxeilFv1NFeK3zmkiBd2W0WJr4xwqTulLu+5Ke8XFTpYKpOm7NRYHS+IpfNlF+TTOazvZ918RTqRlJKHztWkRhur2kxVfFxhOd4uVnqyTt4me/AsFVnBpVLeiurOduOtv0i0w9+OwcJxjHxIKUVbWSuX4fB2p+HVnHXVa9D51wucZjiqnFTc5/afDd2PXmu3OPcoxnJxcLQs7p6HH6vHMzPtv5p/PSdVksuJcMrwv0dz243BU5qMOOKcXe10jUbtcXUrYFVKju2yMN4e0OKo5s6VOdorhfNj6vHmHyzPlNGJy9TpxitbdTDVwMJQjDjjxQ6X1GzNeU8DTnL50o6shPN9pMXDOZUlP0HO1rvuT6nGfJKZviZfzL8Qcj8ZYj+dfmC/T41+aXUbw/oFT/AHoyGd0P1nP2+8mbeH9Aqf70ZDO6H6zn7fefU5vovsUXP3FeiNdtDmMcNhqtaTS8ODkvW0BDu+raHxKscPF/wnaVjZ7ktneFTxE421vBsjanx5nmLkk38In+Gp9L5Dlyw+GpUY2ThFJ+YGwi7t39hottMjlj8HPDxnwSk9JM3OIqRguOUlGMebZjo4+lUdoTjN9kB86bT7AYrLoqrKfGlK91yJD3SbZrEfJJpRcI3Tel32Ol3nU1LAST5Xvf2EI7vZWzFKLsuJa99QJl3rv5D069CPNxCXwqvy9upIO9h/IF/vQjzcSvlVcDo9++KcadGH81zz7jnQpUa86k4RlxK3FbkWb/AP52F9v6nG7I7I4vGwm6VRwgudrge/fS6Xw2jOlKM1L0m4dyVN3GYePlt734YOP4RZGs91ONn8+o5Ncn6iTN32z1TL8BUo1HeT45eyzAgyX1ov7j/M+gtr/q+f8AS/xPn2X1ov7j/M+gtr/q+f8AS/xAhHdD9Ol979SYd5/1fV+4yHt0X06X3v1Jh3n/AFfV+4wIi3OL5bB9pHU7/KzTor/qzl9za+Ww+8b/AH9y/bUF04Qa3G4zK4xw06tldytrrzOP3z5dCjj4yirOSvppzJB3KfQJ/fXuOP36tfDKWn2EJTf1326l/uuHmyI95a/fLfrj7yXN0+uVw82RHvLt8ctLvH3mckiU6bKfV9P7v6EA519ey/qfqT9sr9X0/u/oQDnX17L+p+prFSEABknh2W8P6vqf70ZDW6C/xnP2+8m7bbB1K2DnTpx4pPoRbu12Qx+Gx8qtWlaDvrqETeunsIX33bUJuOEpys4P00vtLsTFjHJUp8K9NQfCv+1j57z/AGMzXF4mpWlh78T53fcDodz+UYeinia01FuzpxfQllZzhm7KrG76XPnynsXnUbKMJqMfmpN2PblmyGc+PCU4zUU9dX3Alrec5PKa7pS4ZPhaaIp3TbQOnjYxxFb0bWbl3Jvll/i4SNGpzdNJ372IK2j3cY6lXnUoQfA5Npq/sAkjenn9BYGUITjKUnpFdu5GG6rLpV8e+BaR9Nv1XPLDYzNq7UKkJSX8zb0RMe7bY1ZdRUpNutJWlfnYC3ez9BX+9CPdxj+VV/USdvGyutiMIqdGPHK70OK3RbLY3CYmtLEUeCMuT1A9u/XBOdKhNLSF7vseDcPm8Ywr0qkrXknG/Uk/abJ4Y3DVKMtOKNlLqiA8dsDmmDqt4dTUE/Rkr6oDr97O2tfDYmlTwtZxTVnw9zudia+IqYBzxEnKcoyacuziyJdnd3mPxdeM8YpcCafE79yeMPhFSw/hR+zTcF+AHzPNP40X9wv/AGfQ21NFzy+pbpRv/wDJDH/Bcw+MvGVNun43FfXlxXJ9dHjpeHLTipqL/CzA+at3GYRw2OTqaKc7XfTUlzefndB4GUYTjJzjbR8jgNs92+MhiXPCwcqd7qS8zS/8Szeu3TdOTXLqBsdy8L4xW+zI6jfxhXJ0Z20UXeXbmdDux2K+LqblVV6s9Xf7LN9tvkXw3CVKSSc2vRfUK4DcbntONGph6jSk5cUb9lc5vfPmlOtjoKnJSUUotruauGw2bUK3DSpyi72Uot8jzbXbN1MDOHjzcqk0pPi7g1Nu6hfuyCXdkR70oqGbyk1ys7+0lvdI/wB2Q+8zU70NhZY39tQV6nVLqBu9kM+wzy6DdSKcYPiV9VoQhmFZVc6Uqb4lOpo15mSOyecU/RhTklycU3ax1OwO7XEfCY4nFJ0+B8Sj0YR0fwCfYEh/F1MqFerzK8ipUIsaKJadjIAMS93IuT5aF1ioGJpXt1ZdJJrXVesusVAx+GlySRjfE/naL1HoKWAtQlp7S4qBZ5Fsldaq9ujMlioGNWS008hJaaF9hYCx6ckVZeALHrz1RbGKWqik/UZSgFklda6XI33uZ1isIqUsPfhUfSadiSZvoaXarI447CzoyS4mrJ9UBxu63bWOJpTWJklVT9FtrkcTvozKniMdTjTlxcMUtOVzJiN0uZwnahKMYd+OzPXk+6PGOtCeKlF8LTupXejAkTddS4ctgmra+R1uq5amDAYWFGEaUFZRivyR6Ve4FiprnZXZXXySMpSwFl0UMlgBUAAAAAAAAAAAAAAAAAAAAAAAAAAWz9XMtv0fMvdy3g6rmBST0s7+wOVkVkmFF39QBrquYh2CTLooCoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/2Q==",
    link: "http://www.123telugu.com/reviews/main/more_reviews.html"
  }
];

async function performScrapeRequest(url: string) {
  console.log(url);
  return await JSDOM.fromURL(url)
    .then((dom) => {
      const { document } = dom.window;
      return document;
    }, (err) => {
      return null;
    });
}

function strToNum(str) {
  const map = {
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "quarter": 0.25,
    "half": 0.5,
    "three quarter": 0.75
  };
  const arr = str.split("and");
  let num: any = null;

  for (const n of arr) {
    const key = n.toLowerCase().trim().replace("\n", "");

    if (map[key]) {
      num += map[key];
    }
  }

  return num;
}

async function createDBFromIdleBrain(criticInfo: any) {
  const dom: any = await performScrapeRequest(criticInfo.link);
  const children = dom.querySelector("body > table:nth-child(2) > tbody > tr:nth-child(1) > td:nth-child(2) > table > tbody > tr > td:nth-child(1) > table > tbody > tr:nth-child(2) > td > table > tbody").children;

  children[children.length - 1].remove();
  children[0].remove();
  children[1].remove();

  for (const child of children) {
    const tds = child.children;
    const nameStr = tds[1].firstChild.firstChild.innerHTML;
    const name = nameStr && nameStr.trim();
    const link = tds[1].firstChild.firstChild.href;
    const ratingStr = tds[3].firstChild.innerHTML;
    const rating = strToNum(ratingStr);

    if (name && link && rating) {
      const movies = await MovieModel.find([{ name }]);
      const movie = movies[0];

      if (movie && movie._id) {
        const ratingId = await ReviewModel.create({
          critic: criticInfo.name,
          logo: criticInfo.image,
          movieId: movie._id,
          url: link,
          rating
        });
      }
    }
  }
}

async function createDBFromGreatAndhra(criticInfo: any) {
  for (let i = 1; i <= 56; i++) {
    const mainLink = criticInfo.link + i;
    const dom: any = await performScrapeRequest(mainLink);
    const elems = dom.getElementsByClassName("movies_news_description_container");

    for (const elem of elems) {
      const link = elem.children[1].children[0].href;
      const pageDom: any = await performScrapeRequest(link);
      const strElem = pageDom.querySelector("body > div.great_andhra_movie_body > div > div.great_andhra_main_body_container > div.two_column.float-left > div.page_news > div.content > p:nth-child(2)");
      const str = strElem && strElem.textContent;

      let name: string = null;
      let rating: string = null;

      if (str) {
        if (str.indexOf("Movie: ") > -1) {
          const arr = str.split("\n");

          if (arr[0]) {
            name = arr[0].trim().split("Movie: ")[1];
          }

          if (arr[1]) {
            const ratingStr = arr[1].trim().split("Rating: ")[1];
            rating = ratingStr && ratingStr.trim().split("/")[0];
          }
        }
        else {
          const titleElem = pageDom.querySelector("body > div.great_andhra_movie_body > div > div.great_andhra_main_body_container > div.two_column.float-left > div.page_news > div.header.color_15");
          const titleStr = titleElem && titleElem.textContent;

          if (titleStr && titleStr.indexOf("Review:") > -1) {
            name = titleStr && titleStr.trim().split("Review:")[0].trim().replace("'", "");
          }

          const ratingElem = pageDom.querySelector("body > div.great_andhra_movie_body > div > div.great_andhra_main_body_container > div.two_column.float-left > div.page_news > div.content > p:nth-child(2) > strong:nth-child(1) > font")
            || pageDom.querySelector("body > div.great_andhra_movie_body > div > div.great_andhra_main_body_container > div.two_column.float-left > div.page_news > div.content > p:nth-child(2) > strong:nth-child(1) > span");
          const ratingStr = ratingElem && ratingElem.textContent;
          rating = ratingStr && ratingStr.trim().split("/")[0];
        }
      }

      if (name && rating) {
        const movies = await MovieModel.find([{ name }]);
        const movie = movies[0];

        if (movie && movie._id) {
          console.log(name, rating);

          const ratingId = await ReviewModel.create({
            critic: criticInfo.name,
            logo: criticInfo.image,
            movieId: movie._id,
            url: link,
            rating
          });
        }
      }
    }
  }
}

async function createDBFrom123Telugu(criticInfo: any) {
  const dom: any = await performScrapeRequest(criticInfo.link);
  const body = dom.querySelector("#showcase > div > div > table > tbody > tr > td > table > tbody > tr > td:nth-child(2) > table > tbody > tr > td:nth-child(1) > table > tbody > tr:nth-child(1) > td > table > tbody");
  const children = body.getElementsByClassName("NormalText");

  for (const child of children) {
    const link = child.href;
    const title = child.innerHTML;

    if (title.indexOf("Review") === -1 && title.indexOf("English Movie") === -1) {
      const pageDom: any = await performScrapeRequest(link);

      if (pageDom) {
        const titleElem = pageDom.getElementsByClassName("MoviePage_title")[0];
        const titleStr = titleElem && titleElem.textContent;
        const name = titleStr && titleStr.split(":")[0].trim();

        const ratingElem = pageDom.getElementsByClassName("reviewsheadtext")[0];
        const ratingContent = ratingElem && ratingElem.textContent;
        const ratingStr = ratingContent && ratingContent.split("Rating:")[1];
        const rating = ratingStr && ratingStr.split("/")[0].trim();

        console.log(name, rating);

        if (name && rating) {
          const movies = await MovieModel.find([{ name }]);
          const movie = movies[0];

          if (movie && movie._id) {
            console.log(name, rating);

            const ratingId = await ReviewModel.create({
              critic: criticInfo.name,
              logo: criticInfo.image,
              movieId: movie._id,
              url: link,
              rating
            });
          }
        }
      }
    }
  }
}

async function initRatingsDB() {
  const startTime = Date.now();

  for (const criticInfo of criticsInfo) {
    if (criticInfo.name === "idlebrain") {
      await createDBFromIdleBrain(criticInfo);
    }
    else if (criticInfo.name === "greatandhra") {
      // await createDBFromGreatAndhra(criticInfo);
    }
    else if (criticInfo.name === "123telugu") {
      // await createDBFrom123Telugu(criticInfo);
    }
  }

  const endTime = Date.now();
  const timeTaken = (endTime - startTime) / 1000;
  console.log("database creation completed!! TimeTaken: ", timeTaken);
}

initRatingsDB();
