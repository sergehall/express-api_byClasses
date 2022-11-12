import {BloggersRepository} from "./repositories/bloggers-db-repository";
import {BloggersService} from "./domain/bloggers-service";
import {BloggersController} from "./presentation/bloggersCotroller";
import {UsersRepository} from "./repositories/users-db-repository";
import {UsersService} from "./domain/users-service";
import {UsersController} from "./presentation/usersController";
import {PostsRepository} from "./repositories/posts-db-repository";
import {PostsService} from "./domain/posts-service";
import {PostsController} from "./presentation/postsController";
import {FeedbacksRepository} from "./repositories/feedback-db-repository";
import {FeedbacksService} from "./domain/feedbacks-service";
import {FeedbacksController} from "./presentation/feedbacksController";
import {AllDeletedBloggersPostsRepository} from "./repositories/all-deleted-bloggers-db-repository";
import {AllDelBloggersService} from "./domain/all-del-bloggers-service";
import {AllDelBloggersController} from "./presentation/all-dell-bloggersController";
import {CommentsService} from "./domain/comments-service";
import {CommentsRepository} from "./repositories/comments-db-repository";
import {CommentsController} from "./presentation/commentsController";
import {UsersAccountRepository} from "./repositories/usersAccount-db-repository";
import {UsersAccountService} from "./domain/usersAccount-service";
import {UsersAccountController} from "./presentation/userAccountsController";
import {BlogsRepository} from "./repositories/blogs-db-repository";
import {BlogsService} from "./domain/blogs-service";
import {BlogsController} from "./presentation/blogsController";
import {
  SecurityDevicesRepository
} from "./repositories/securityDevices-db-repository";
import {SecurityDevicesService} from "./domain/securityDevices-service";
import {SecurityDevicesController} from "./presentation/deviceController";
import {BlackListIPRepository} from "./repositories/blackListIP-repository";
import {EmailsToSentRepository} from "./repositories/emailsToSent-db-repository";
import {UsersIPLast10secRepositories,} from "./repositories/usersIPlast10sec-bd-repository";
import {
  BlackListRefreshTokenJWTRepository
} from "./repositories/blackListRefreshTokenJWT-db-repository";
import {Auth} from "./middlewares/auth";
import {ParseQuery} from "./middlewares/parse-query";
import {PreparationPosts} from "./repositories/preparation-posts";
import {PreparationComments} from "./repositories/preparation-comments";
import {JWTService} from "./application/jwt-service";
import {EmailSender} from "./demons/emailSender";
import {EmailAdapter} from "./adapters/email-adapter";
import {ClearingInvalidJWTFromBlackList} from "./demons/clearingInvalidJWTFromBlackList";
import {ClearingDevicesWithExpDate} from "./demons/clearingDevicesWithExpDate";
import {ClearingIpWithCreatedAtOlder10Sec} from "./demons/clearingIpWithCreatedAtOlder10Sec";
import {
  AddAndCountReqWithSameIpLast10secService
} from "./domain/addAndCountReqWithSameIpLast10secService";

// usersAccount
const usersAccountRepository = new UsersAccountRepository()
const usersAccountService = new UsersAccountService(usersAccountRepository)
const usersAccountController = new UsersAccountController(usersAccountService)
// auth
const auth = new Auth()
// middleware
const addAndCountReqWithSameIpLast10secService = new AddAndCountReqWithSameIpLast10secService()
const parseQuery = new ParseQuery()
// posts
const postsRepository = new PostsRepository()
const postsService = new PostsService(postsRepository)
const postsController = new PostsController(postsService)
// bloggers
const bloggersRepository = new BloggersRepository()
const bloggersService = new BloggersService(bloggersRepository)
const bloggersController = new BloggersController(bloggersService, postsService)
// users
const usersRepository = new UsersRepository()
const usersService = new UsersService(usersRepository)
const usersController = new UsersController(usersService)
// feedbacks
const feedbacksRepository = new FeedbacksRepository()
const feedbacksService = new FeedbacksService(feedbacksRepository)
const feedbacksController = new FeedbacksController(feedbacksService)
// allDeletedBloggers
const allDeletedBloggersPostsRepository = new AllDeletedBloggersPostsRepository()
const allDelBloggersService = new AllDelBloggersService(allDeletedBloggersPostsRepository)
const allDelBloggersController = new AllDelBloggersController(allDelBloggersService)
// comments
const commentsRepository = new CommentsRepository()
const commentsService = new CommentsService(commentsRepository)
const commentsController = new CommentsController(commentsService)
// Repositories
const blackListIPRepository = new BlackListIPRepository()
const emailsToSentRepository = new EmailsToSentRepository()
const usersIPLast10secRepositories = new UsersIPLast10secRepositories()
const blackListRefreshTokenJWTRepository = new BlackListRefreshTokenJWTRepository()
// Blogs
const blogsRepository = new BlogsRepository()
const blogsService = new BlogsService(blogsRepository)
const blogsController = new BlogsController(blogsService, postsService)
// PostsExtLikesInfo
const preparationPostsForReturn = new PreparationPosts()
// CommentsExtLikesInfo
const preparationComments = new PreparationComments()
// Devices
const securityDevicesRepository = new SecurityDevicesRepository()
const securityDevicesService = new SecurityDevicesService(securityDevicesRepository)
const securityDevicesController = new SecurityDevicesController(securityDevicesService)
// JWT Service
const jwtService = new JWTService()
// email adapter
const emailAdapter = new EmailAdapter()
// my demons
const emailSender = new EmailSender()
const clearingIpWithCreatedAtOlder10Sec = new ClearingIpWithCreatedAtOlder10Sec()
const clearingInvalidJWTFromBlackList = new ClearingInvalidJWTFromBlackList()
const clearingDevicesWithExpDate = new ClearingDevicesWithExpDate()

export const ioc = {
  auth: auth,
  bloggersService: bloggersService,
  bloggersController: bloggersController,
  postsService: postsService,
  postsController: postsController,
  feedbacksService: feedbacksService,
  feedbacksController: feedbacksController,
  usersService: usersService,
  usersController: usersController,
  commentsService: commentsService,
  commentsController: commentsController,
  allDelBloggersService: allDelBloggersService,
  allDelBloggersController: allDelBloggersController,
  blogsService: blogsService,
  blogsController: blogsController,
  usersAccountService: usersAccountService,
  preparationPostsForReturn: preparationPostsForReturn,
  blackListIPRepository: blackListIPRepository,
  emailsToSentRepository: emailsToSentRepository,
  usersIPLast10secRepositories: usersIPLast10secRepositories,
  usersAccountController: usersAccountController,
  blackListRefreshTokenJWTRepository: blackListRefreshTokenJWTRepository,
  addAndCountReqWithSameIpLast10secService: addAndCountReqWithSameIpLast10secService,
  preparationComments: preparationComments,
  parseQuery: parseQuery,
  securityDevicesService: securityDevicesService,
  securityDevicesController: securityDevicesController,
  jwtService: jwtService,
  emailSender: emailSender,
  emailAdapter: emailAdapter,
  clearingIpWithCreatedAtOlder10Sec: clearingIpWithCreatedAtOlder10Sec,
  clearingInvalidJWTFromBlackList: clearingInvalidJWTFromBlackList,
  clearingDevicesWithExpDate: clearingDevicesWithExpDate
}