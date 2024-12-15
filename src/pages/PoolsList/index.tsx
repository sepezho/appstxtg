import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import {
  PoolsListContainer,
  PoolItem,
  Icon,
  Locked
} from './styles'
import { pools, tonPytnId } from "src/config"
import type { RootState } from 'src/store/reducers'
import { useSelector, useDispatch } from 'react-redux'
import { getPrice } from "src/helpers/calculatePrice"
import { loadImage } from "src/helpers/getLoadImage";


const PoolsList = () => {
  const navigate = useNavigate();
  const prices = useSelector((state: RootState) => state.prices)

  const moveTo = (url: string) => {
    navigate(url); //todo: add token to walle
  }

  return (
    <PoolsListContainer>
      <li>ton price: {getPrice(prices, tonPytnId)}$</li>
      {pools.map((pool) => (
        <PoolItem onClick={() => moveTo("/pool/" + pool.title)} key={pool.title}>
          <Icon src={loadImage(pool.icon)} /> {pool.title} / ${getPrice(prices, pool.syntPythId)}
        </PoolItem>
      ))}
      <Link to={"https://syde.fi"}>?about</Link>
      {/*
      <AboutBtn onClick={() => moveTo('/swap')}>synt swap</AboutBtn >
      <br />
      <Locked>swap(soon)</Locked>
      */}
    </PoolsListContainer >
  )
}

export default PoolsList;
