import { Types } from "mongoose"
import { BookModel } from "../books"
import { CategoryTreeNode, FormattedCategory, ICategory } from "./interface"
import { AppError } from "../../common/errors/AppError"
import { CategoryModel } from "./model"

export const formatCategory = (
  category: ICategory | null,
  booksCount = 0,
): FormattedCategory => {
  if (!category) {
    throw new AppError('Category not found.', 404)
  }

  const parentId = category.parentId?.toString()
  const description = category.description

  return {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    ...(description ? { description } : {}),
    ...(parentId ? { parentId, parent_id: parentId } : {}),
    sortOrder: category.sortOrder,
    isActive: category.isActive,
    booksCount,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  }
}

export const ensureParentIsValid = async (
  selfId: string | undefined,
  parentId: string | undefined,
) => {
  if (!parentId) {
    return
  }

  if (selfId && selfId === parentId) {
    throw new AppError('A category cannot be parent of itself.', 400)
  }

  const parent = await CategoryModel.findById(parentId)

  if (!parent) {
    throw new AppError('Parent category not found.', 404)
  }

  if (selfId) {
    const ancestors = await CategoryModel.aggregate<{
      ancestors: Array<{ _id: Types.ObjectId }>
    }>([
      { $match: { _id: parent._id } },
      {
        $graphLookup: {
          from: 'categories',
          startWith: '$parentId',
          connectFromField: 'parentId',
          connectToField: '_id',
          as: 'ancestors',
        },
      },
    ])

    const hasCycle = (ancestors[0]?.ancestors ?? []).some(
      (node) => node._id.toString() === selfId,
    )

    if (hasCycle) {
      throw new AppError('Category hierarchy cycle is not allowed.', 400)
    }
  }
}

export const buildTree = (
  categories: ICategory[],
  countsByCategoryId: Map<string, number>,
) => {
  const nodeMap = new Map<string, CategoryTreeNode>()
  const parentMap = new Map<string, string | undefined>()

  categories.forEach((category) => {
    const id = category._id.toString()
    parentMap.set(id, category.parentId?.toString())
    nodeMap.set(id, {
      ...formatCategory(category, countsByCategoryId.get(id) ?? 0),
      children: [],
    })
  })

  const roots: CategoryTreeNode[] = []

  nodeMap.forEach((node, id) => {
    const parentId = parentMap.get(id)

    if (parentId) {
      const parent = nodeMap.get(parentId)

      if (parent) {
        parent.children.push(node)
        return
      }
    }

    roots.push(node)
  })

   const sortChildren = (items: CategoryTreeNode[]) => {
    items.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder
      }
      return a.name.localeCompare(b.name)
    })

    items.forEach((item) => sortChildren(item.children))
  }

  sortChildren(roots)
  return roots
}

export const countBooksPerCategory = async (categories: ICategory[]) => {
  if (!categories.length) {
    return new Map<string, number>()
  }

  const categoryObjectIds = categories.map((category) => category._id)
  const rows: Array<{ _id: Types.ObjectId; count: number }> =
    await BookModel.aggregate([
      { $match: { categoryIds: { $in: categoryObjectIds } } },
      { $unwind: '$categoryIds' },
      { $match: { categoryIds: { $in: categoryObjectIds } } },
      { $group: { _id: '$categoryIds', count: { $sum: 1 } } },
    ])

  const map = new Map<string, number>()
  rows.forEach((row) => {
    map.set(row._id.toString(), row.count)
  })

  return map
}
