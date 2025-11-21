// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui';

export function DataPagination({
  currentPage,
  totalPages,
  onPageChange
}) {
  const pages = [];
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  return <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={() => currentPage > 1 && onPageChange(currentPage - 1)} className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
        </PaginationItem>
        
        {startPage > 1 && <>
            <PaginationItem>
              <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
            </PaginationItem>
            {startPage > 2 && <PaginationEllipsis />}
          </>}
        
        {pages.map(page => <PaginationItem key={page}>
            <PaginationLink onClick={() => onPageChange(page)} isActive={page === currentPage} className="cursor-pointer">
              {page}
            </PaginationLink>
          </PaginationItem>)}
        
        {endPage < totalPages && <>
            {endPage < totalPages - 1 && <PaginationEllipsis />}
            <PaginationItem>
              <PaginationLink onClick={() => onPageChange(totalPages)}>
                {totalPages}
              </PaginationLink>
            </PaginationItem>
          </>}
        
        <PaginationItem>
          <PaginationNext onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)} className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>;
}