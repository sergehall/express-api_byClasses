
import {BlogsRepository} from "../repositories/blogs-db-repository";
import {
  BlogsType,
  Pagination,
  ReturnObjBlogType, SortOrder,
  UserType
} from "../types/types";

export class BlogsService {
  constructor(protected blogsRepository: BlogsRepository) {
    this.blogsRepository = blogsRepository
  }

  async findBlogs(pageNumber: number, pageSize: number, sortBy: string| null, sortDirection: SortOrder): Promise<Pagination> {
    return await this.blogsRepository.findBlogs(pageNumber, pageSize, sortBy, sortDirection)
  }

  async createBlog(name: string, websiteUrl: string): Promise<ReturnObjBlogType> {
    return await this.blogsRepository.createBlog(name, websiteUrl)
  }

  async findAllPostsByBlogId(pageNumber: number, pageSize: number, sortBy: string | null, sortDirection: SortOrder, blogId: string,  currentUser: UserType | null): Promise<Pagination | null> {
    return await this.blogsRepository.findAllPostsByBlogId(pageNumber, pageSize, sortBy, sortDirection, blogId, currentUser)
  }
  
  async findBlogById(id: string): Promise<BlogsType | null> {
    return await this.blogsRepository.findBlogById(id)
  }

  async updatedBlogById(name: string, websiteUrl: string, id: string): Promise<ReturnObjBlogType>{
    return await this.blogsRepository.updatedBlogById(name, websiteUrl, id)
  }

  async deletedBlogById(id: string): Promise<Boolean> {
    return await this.blogsRepository.deletedBlogById(id)
  }
}