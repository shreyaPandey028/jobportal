import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'

const AppliedJobTable = () => {
  return (
    <div>
      <Table>
        <TableCaption> A list of your applied jobs</TableCaption>
        <TableHeader>
          <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Job Role</TableHead>
          <TableHead>Company</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
        </TableHeader>
        <TableBody>
          {
            [1,2].map((item, index) => (
              <TableRow key={index}>
                <TableCell>2023-01-01</TableCell>
                <TableCell>Software Developer</TableCell>
                <TableCell>XYZ Corp.</TableCell>
                <TableCell className="text-right" ><Badge>Selected</Badge></TableCell>
              </TableRow>
            ))
          }
        </TableBody>
        
      </Table>
    </div>
  )
}

export default AppliedJobTable