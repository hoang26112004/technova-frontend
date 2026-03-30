import React from 'react'

const HeaderAdmin = ({title}) => {
  return (
    <header className="bg-[#FFFDD0] bg-opacity-50 backdrop-blur-md shadow-lg ">
			<div className="max-w-7xl flex justify-between items-center mx-auto py-4 px-4 sm:px-6 lg:px-8">
				<h1 className="text-2xl font-semibold text-black">
					{title}
				</h1>
			</div>
		</header>
  )
}

export default HeaderAdmin