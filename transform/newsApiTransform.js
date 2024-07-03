import { getImgUrl } from "../utils/helper.js";

class NewsApiTransform {
    static transform(news) {
        return {
            id: news.id,
            heading: news.title,
            news: news.content,
            image: getImgUrl(news.image),
            reporter: {
                id: news?.user.id,
                name: news?.user.name,
                profile: news?.user?.profile !== null ? getImgUrl(news?.user?.profile) : null,
            },
            created_at: news.created_at,
            updated_at: news.updated_at,
        }
    }
}

export default NewsApiTransform;