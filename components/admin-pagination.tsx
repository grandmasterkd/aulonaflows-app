"use client"

import { useRouter, usePathname } from "next/navigation"
import { Pagination } from "@/components/ui/pagination"

interface AdminPaginationProps {
  currentPage: number
  totalItems: number
  itemsPerPage: number
}

export function AdminPagination({ currentPage, totalItems, itemsPerPage }: AdminPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams()
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Pagination
      currentPage={currentPage}
      totalItems={totalItems}
      itemsPerPage={itemsPerPage}
      onPageChange={handlePageChange}
    />
  )
}