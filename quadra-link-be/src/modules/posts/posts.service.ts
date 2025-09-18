import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { Like } from './entities/like.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateLikeDto } from './dto/create-like.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepo: Repository<Post>,
    @InjectRepository(Comment) private commentsRepo: Repository<Comment>,
    @InjectRepository(Like) private likesRepo: Repository<Like>,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  /** Create a new post */
  async create(authorId: string, dto: CreatePostDto): Promise<Post> {
    const author = await this.usersRepo.findOne({ where: { id: authorId } });
    if (!author) throw new NotFoundException('Author not found');

    const post = this.postsRepo.create({
      ...dto,
      author,
    });

    return this.postsRepo.save(post);
  }

  /** Update Post */
  async update(id: string, userId: string, dto: Partial<CreatePostDto>): Promise<Post> {
    const post = await this.postsRepo.findOne({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.author.id !== userId) {
      throw new BadRequestException('You can only update your own posts');
    }
    Object.assign(post, dto);
    return this.postsRepo.save(post);
  }

  /** Add a comment to a post */
  async addComment(userId: string, dto: CreateCommentDto): Promise<Comment> {
    const post = await this.postsRepo.findOne({ where: { id: dto.postId } });
    if (!post) throw new NotFoundException('Post not found');

    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const comment = this.commentsRepo.create({
      content: dto.content,
      post,
      author: user,
    });

    await this.postsRepo.update(dto.postId, {
      commentsCount: () => '"commentsCount" + 1',
    });

    return this.commentsRepo.save(comment);
  }

  /** Delete a comment */
  async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.commentsRepo.findOne({
      where: { id: commentId },
      relations: ['author', 'post'],
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author.id !== userId) {
      throw new BadRequestException('You can only delete your own comments');
    }
    await this.commentsRepo.remove(comment);
    await this.postsRepo.update(comment.post.id, {
      commentsCount: () => '"commentsCount" - 1',
    });
  }

  /** Like a post */
  async likePost(userId: string, dto: CreateLikeDto): Promise<Like> {
    const post = await this.postsRepo.findOne({ where: { id: dto.postId } });
    if (!post) throw new NotFoundException('Post not found');

    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const existingLike = await this.likesRepo.findOne({
      where: { user: { id: userId }, post: { id: dto.postId } },
    });

    if (existingLike) {
      throw new BadRequestException('User already liked this post');
    }

    const like = this.likesRepo.create({
      post,
      user,
    });

    await this.postsRepo.update(dto.postId, {
      likesCount: () => '"likesCount" + 1',
    });

    return this.likesRepo.save(like);
  }

  /** Unlike a post */
  async unlikePost(userId: string, postId: string): Promise<void> {
    const like = await this.likesRepo.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });

    if (!like) throw new NotFoundException('Like not found');

    await this.likesRepo.remove(like);

    await this.postsRepo.update(postId, {
      likesCount: () => '"likesCount" - 1',
    });
  }

  /** Fetch all posts */
  async findAll(): Promise<Post[]> {
    return this.postsRepo.find({
      relations: ['author', 'comments', 'likes'],
      order: { createdAt: 'DESC' },
    });
  }

  /** Fetch single post */
  async findOne(id: string): Promise<Post> {
    const post = await this.postsRepo.findOne({
      where: { id },
      relations: ['author', 'comments', 'likes'],
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  /** Delete a post */
  async remove(id: string, userId: string): Promise<void> {
    const post = await this.postsRepo.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.author.id !== userId) {
      throw new BadRequestException('You can only delete your own posts');
    }
    await this.postsRepo.remove(post);
  }
}
